const TZ = process.env.INTEL_SCOUT_TZ || 'Europe/Moscow';

function todayLocal(tz = TZ) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

module.exports = { todayLocal, TZ };
