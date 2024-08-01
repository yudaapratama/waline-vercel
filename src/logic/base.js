const path = require('node:path');
const qs = require('node:querystring');

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const helper = require('think-helper');

module.exports = class extends think.Logic {
  constructor(...args) {
    super(...args);
    this.modelInstance = this.getModel('Users');
    this.resource = this.getResource();
    this.id = this.getId();
  }

  async __before() {
    const referrer = this.ctx.referrer(true);
    let { secureDomains } = this.config();

    if (secureDomains && referrer && this.ctx.host.indexOf(referrer) !== 0) {
      secureDomains = think.isArray(secureDomains)
        ? secureDomains
        : [secureDomains];
      secureDomains.push(
        'localhost',
        '127.0.0.1',
        'github.com',
        'api.twitter.com',
        'www.facebook.com',
        'api.weibo.com',
        'graph.qq.com',
      );

      const match = secureDomains.some((domain) =>
        think.isFunction(domain.test)
          ? domain.test(referrer)
          : domain === referrer,
      );

      if (!match) {
        return this.ctx.throw(403);
      }
    }

    this.ctx.state.userInfo = {};
    const { authorization } = this.ctx.req.headers;
    const { state } = this.get();

    if (!authorization && !state) {
      return;
    }
    const token = state || authorization.replace(/^Bearer /, '');
    let userMail = '';

    try {
      userMail = jwt.verify(token, think.config('jwtKey'));
    } catch (e) {
      think.logger.debug(e);
    }

    if (think.isEmpty(userMail) || !think.isString(userMail)) {
      return;
    }

    const user = await this.modelInstance.select(
      { email: userMail },
      {
        field: [
          'id',
          'email',
          'url',
          'display_name',
          'type',
          'github',
          'twitter',
          'facebook',
          'google',
          'weibo',
          'qq',
          'avatar',
          '2fa',
          'label',
        ],
      },
    );

    if (think.isEmpty(user)) {
      return;
    }

    const userInfo = user[0];

    let avatarUrl = userInfo.avatar
      ? userInfo.avatar
      : await think.service('avatar').stringify({
          mail: userInfo.email,
          nick: userInfo.display_name,
          link: userInfo.url,
        });
    const { avatarProxy } = think.config();

    if (avatarProxy) {
      avatarUrl = avatarProxy + '?url=' + encodeURIComponent(avatarUrl);
    }
    userInfo.avatar = avatarUrl;
    userInfo.mailMd5 = helper.md5(userInfo.email);
    this.ctx.state.userInfo = userInfo;
    this.ctx.state.token = token;
  }

  getResource() {
    const filename = this.__filename || __filename;
    const last = filename.lastIndexOf(path.sep);

    return filename.substr(last + 1, filename.length - last - 4);
  }

  getId() {
    const id = this.get('id');

    if (id && (think.isString(id) || think.isNumber(id))) {
      return id;
    }

    const last = decodeURIComponent(this.ctx.path.split('/').pop());

    if (last !== this.resource && /^([a-z0-9]+,?)*$/i.test(last)) {
      return last;
    }

    return '';
  }

  async useCaptchaCheck() {
    const { RECAPTCHA_V3_SECRET, TURNSTILE_SECRET } = process.env;
    const { turnstile, recaptchaV3 } = this.post();

    if (TURNSTILE_SECRET) {
      return this.useRecaptchaOrTurnstileCheck({
        secret: TURNSTILE_SECRET,
        token: turnstile,
        api: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        method: 'POST',
      });
    }

    if (RECAPTCHA_V3_SECRET) {
      return this.useRecaptchaOrTurnstileCheck({
        secret: RECAPTCHA_V3_SECRET,
        token: recaptchaV3,
        api: 'https://recaptcha.net/recaptcha/api/siteverify',
        method: 'GET',
      });
    }
  }

  async useRecaptchaOrTurnstileCheck({ secret, token, api, method }) {
    if (!secret) {
      return;
    }

    if (!token) {
      return this.ctx.throw(403);
    }

    const query = qs.stringify({
      secret,
      response: token,
      remoteip: this.ctx.ip,
    });

    const requestUrl = method === 'GET' ? api + '?' + query : api;
    const options =
      method === 'GET'
        ? {}
        : {
            method,
            headers: {
              'content-type':
                'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: query,
          };

    const response = await fetch(requestUrl, options).then((resp) =>
      resp.json(),
    );

    if (!response.success) {
      think.logger.debug(
        'RecaptchaV3 or Turnstile Result:',
        JSON.stringify(response, null, '\t'),
      );

      return this.ctx.throw(403);
    }
  }
};
