// Talks & Podcast: shared selection rules for YMN Homepage v2 and YMN Learn.
// Only published records are used. Internal notes are never read.
(function () {
  var TG = 'https://t.me/+P0w6oXmyPBBjODA1';
  var MIC = 'assets/08-sticker-lecture-microphone.png';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function ytId(url) {
    if (!url) return '';
    try {
      var u = new URL(String(url).trim()), h = u.hostname.replace(/^(www|m|music)\./, ''), id = '';
      if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
      else if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) {
        if (u.pathname === '/watch') id = u.searchParams.get('v') || '';
        else { var m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/); if (m) id = m[2]; }
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
    } catch (e) { return ''; }
  }
  function listId(url) {
    if (!url) return '';
    try { var l = new URL(String(url).trim()).searchParams.get('list') || ''; return /^[A-Za-z0-9_-]{10,}$/.test(l) ? l : ''; } catch (e) { return ''; }
  }
  function lines(s) { return String(s || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); }
  function person(line) { var p = line.split('|'); return { name: p[0].trim(), role: (p[1] || '').trim() }; }
  function fmtDate(iso) {
    var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1] : '';
  }
  function fmtDur(d) {
    var p = String(d || '').split(':').map(Number);
    if (!d || p.some(isNaN)) return '';
    var s = p.reduce(function (a, b) { return a * 60 + b; }, 0), h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
    return (h ? h + ' hr ' : '') + m + ' min';
  }
  function linkPairs(s) {
    return lines(s).map(function (l) { var i = l.indexOf(':'); return { label: l.slice(0, i).trim(), url: l.slice(i + 1).trim() }; })
      .filter(function (x) { return x.label && /^https:\/\//.test(x.url); });
  }

  // Built-in copy of the published records, used if content/ymn-content.json fails to load.
  var FALLBACK = {
    mediaSeries: [{ id: 'health-talks', status: 'published', title: 'Health Talks', summary: 'Online health talks with doctors, recorded and published on The Youth Medical Network’s YouTube channel.', playlistUrl: '', channelName: 'The Youth Medical Network', channelUrl: 'https://www.youtube.com/@TheYouthMedicalNetwork' }],
    videoTalks: [
      { id: 'health-talk-2-cancer-unmasked', status: 'published', title: '[The Youth Medical Network] Health Talk #2: Cancer Unmasked (13 Oct 2024)', shortTitle: 'Cancer Unmasked', series: 'health-talks', number: 2,
        youtubeUrl: '', embedStatus: 'Not checked', channelName: 'The Youth Medical Network', channelUrl: 'https://www.youtube.com/@TheYouthMedicalNetwork',
        eventDate: '2024-10-13', eventDetails: 'Online, on Zoom, 9.15am–10.30am', publishedAt: '', duration: '1:08:38',
        speakers: 'Dr Hendrick Tan | Radiation oncologist', organisers: 'The Youth Medical Network', topics: 'Cancer',
        summary: 'An online health talk with Dr Hendrick Tan, a radiation oncologist. The talk artwork gives its theme as “Real Talk: Cancer Unmasked – Journey of a Cancer Diagnosis”.',
        thumbnail: '', thumbnailAlt: '', captions: '', transcript: '', notes: '', resources: '', related: ['health-talk-1-sleep-mental-health'], featured: 'Yes' },
      { id: 'health-talk-1-sleep-mental-health', status: 'published', title: '[The Youth Medical Network] Health Talk #1: Exploring Sleep Disorder and Mental Health', shortTitle: 'Exploring Sleep Disorder and Mental Health', series: 'health-talks', number: 1,
        youtubeUrl: '', embedStatus: 'Not checked', channelName: 'The Youth Medical Network', channelUrl: 'https://www.youtube.com/@TheYouthMedicalNetwork',
        eventDate: '', eventDetails: 'Online', publishedAt: '', duration: '1:08:29',
        speakers: 'Dr Jared Ng | Psychiatrist, Senior Consultant, Connections MindHealth', organisers: 'The Youth Medical Network', topics: 'Mental health\nSleep',
        summary: 'An online health talk with Dr Jared Ng, a psychiatrist. His presentation is titled “Sweet Dreams are Made of These: Mental Health & Sleep”.',
        thumbnail: '', thumbnailAlt: '', captions: '', transcript: '', notes: '', resources: '', related: ['health-talk-2-cancer-unmasked'], featured: 'No' }
    ],
    podcastEpisodes: [],
    upcomingEpisodes: []
  };

  // Layout-review only (tweak). Clearly marked; never published.
  var SAMPLES = [
    { id: 'sample-a', status: 'published', sample: true, title: '[Sample] Upcoming episode title', teaser: '[Sample] One or two sentences on what the conversation covers.', topic: '[Sample topic]', hosts: '[Sample host]', guests: '[Sample guest] | [Sample role]', publicationStatus: 'Coming soon', releaseDate: '', releaseTime: '', artwork: '', updatesUrl: TG, previewNotes: '' },
    { id: 'sample-b', status: 'published', sample: true, title: '[Sample] Scheduled episode title', teaser: '[Sample] A scheduled episode with a confirmed release time shows a countdown.', topic: '[Sample topic]', hosts: '[Sample host]', guests: '', publicationStatus: 'Scheduled', releaseDate: '', releaseTime: new Date(Date.now() + 9 * 864e5 + 5 * 36e5).toISOString(), artwork: '', updatesUrl: TG, previewNotes: '[Sample] Preview notes appear on the episode preview page.' }
  ];

  function build(d, opts) {
    d = d || FALLBACK; opts = opts || {};
    var pub = function (a) { return (a || []).filter(function (r) { return r.status === 'published'; }); };
    var series = pub(d.mediaSeries).map(function (s) { return Object.assign({}, s, { listId: listId(s.playlistUrl) }); });
    var seriesById = {}; series.forEach(function (s) { seriesById[s.id] = s; });

    var talks = pub(d.videoTalks).map(function (t) {
      var id = ytId(t.youtubeUrl), blocked = t.embedStatus === 'Embedding disabled' || t.embedStatus === 'Unavailable';
      var date = t.publishedAt || t.eventDate || '';
      return Object.assign({}, t, {
        kind: 'talk', format: 'Video talk', videoId: id, embedOk: !!id && !blocked, blocked: blocked && !!id,
        watchUrl: id ? 'https://www.youtube.com/watch?v=' + id : '',
        people: lines(t.speakers).map(person), topicList: lines(t.topics), sortDate: date,
        dateLabel: t.publishedAt ? 'Published ' + fmtDate(t.publishedAt) : (t.eventDate ? 'Recorded ' + fmtDate(t.eventDate) : ''),
        durLabel: fmtDur(t.duration), seriesRec: seriesById[t.series] || null,
        heading: t.shortTitle || t.title, href: '#/talks-and-podcast/talks/' + t.id,
        art: t.thumbnail || MIC, hasThumb: !!t.thumbnail,
        action: id && !blocked ? 'Watch talk' : 'View talk'
      });
    });

    var episodes = pub(d.podcastEpisodes).filter(function (e) { return e.publicationApproved === 'Yes' && (e.audioUrl || e.embedUrl); }).map(function (e) {
      return Object.assign({}, e, {
        kind: 'episode', format: 'Podcast episode', hostList: lines(e.hosts).map(person), guestList: lines(e.guests).map(person),
        people: lines(e.hosts).map(person).concat(lines(e.guests).map(person)),
        topicList: lines(e.topics), sortDate: e.publishedAt || '', dateLabel: e.publishedAt ? 'Published ' + fmtDate(e.publishedAt) : '',
        durLabel: fmtDur(e.duration), heading: e.title, href: '#/talks-and-podcast/episodes/' + e.id,
        art: e.artwork || MIC, hasThumb: !!e.artwork, platforms: linkPairs(e.platformLinks), action: 'Listen to episode'
      });
    });
    var epIds = {}; episodes.forEach(function (e) { epIds[e.id] = true; });

    var up = pub(d.upcomingEpisodes).concat(opts.samples ? SAMPLES : []).filter(function (u) { return !(u.publishedEpisode && epIds[u.publishedEpisode]); });
    var upcoming = up.map(function (u) {
      var t = u.releaseTime ? Date.parse(u.releaseTime) : NaN, dateIso = u.releaseDate || (u.releaseTime ? u.releaseTime.slice(0, 10) : '');
      var label = u.publicationStatus || 'In development';
      if (label === 'Scheduled') label = dateIso ? 'Scheduled for ' + fmtDate(dateIso) : 'Coming soon';
      var hasPreview = !!(u.teaser || u.previewNotes);
      return Object.assign({}, u, {
        kind: 'upcoming', format: 'Upcoming episode', statusLabel: label, releaseMs: isNaN(t) ? 0 : t,
        hostList: lines(u.hosts).map(person), guestList: lines(u.guests).map(person), topicList: lines(u.topic),
        heading: u.title, href: '#/talks-and-podcast/upcoming/' + u.id, hasPreview: hasPreview,
        updatesUrl: /^https:\/\//.test(u.updatesUrl || '') ? u.updatesUrl : TG, art: u.artwork || MIC, hasThumb: !!u.artwork,
        action: hasPreview ? 'View episode' : 'Get updates'
      });
    }).sort(function (a, b) { return (a.releaseMs || 9e15) - (b.releaseMs || 9e15); });

    var published = talks.concat(episodes).sort(function (a, b) {
      if (a.sortDate && b.sortDate) return b.sortDate.localeCompare(a.sortDate);
      if (a.sortDate || b.sortDate) return a.sortDate ? -1 : 1;
      return (b.number || 0) - (a.number || 0);
    });
    var featured = published.find(function (x) { return x.featured === 'Yes'; }) || published[0] || null;
    var all = {}; published.concat(upcoming).forEach(function (x) { all[x.kind + ':' + x.id] = x; });
    return { series: series, talks: talks, episodes: episodes, upcoming: upcoming, published: published, featured: featured, byKey: all };
  }

  function countdown(ms) {
    var left = ms - Date.now();
    if (!ms || left <= 0) return '';
    var d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5), m = Math.floor((left % 36e5) / 6e4);
    return (d ? d + (d === 1 ? ' day, ' : ' days, ') : '') + h + (h === 1 ? ' hour' : ' hours') + (d ? '' : ', ' + m + ' min');
  }

  window.YMNMedia = { build: build, ytId: ytId, listId: listId, fmtDate: fmtDate, fmtDur: fmtDur, countdown: countdown, TG: TG, MIC: MIC };
})();
