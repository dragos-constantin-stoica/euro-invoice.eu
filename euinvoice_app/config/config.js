const PORT = process.env.APP_PORT || 9091,
  HOST = '0.0.0.0',
  NODE_ENV = process.env.NODE_ENV || 'DEV',
  COUCH_ADMIN_URL = 'http://couch_admin:8090',
  EXPRESS_SESSION = 'The quick brown fox jumps over the lazy dog.',
  APPLICATION = 'Euro Invoice',
  VERSION = '1.0.0';

module.exports = {
    PORT: PORT,
	HOST: HOST,
	NODE_ENV: NODE_ENV,
	COUCH_ADMIN_URL: COUCH_ADMIN_URL,
	EXPRESS_SESSION: EXPRESS_SESSION,
	APPLICATION: APPLICATION,
	VERSION: VERSION
}
