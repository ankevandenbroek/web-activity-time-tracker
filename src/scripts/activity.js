'use strict';

class Activity {
  addTab(tab) {
    if (this.isValidPage(tab) === true) {
      if (tab.id && tab.id != 0) {
        tabs = tabs || [];
        var domain = this.extractHostname(tab.url);
        var isDifferentUrl = false;
        if (currentTab !== tab.url) {
          isDifferentUrl = true;
        }

        if (this.isNewUrl(domain) && this.isInWhitelist(domain)) {
          var favicon = tab.favIconUrl;
          if (favicon === undefined) {
            favicon = 'chrome://favicon/' + domain;
          }
          var newTab = new Tab(domain, favicon);
          tabs.push(newTab);
        }

        if (isDifferentUrl && this.isInWhitelist(domain)) {
          this.setCurrentActiveTab(domain);
          var tabUrl = this.getTab(domain);
          if (tabUrl !== undefined) tabUrl.incCounter();
          this.addTimeInterval(domain);
        }
      }
    } else this.closeIntervalForCurrentTab();
  }

  isValidPage(tab) {
    if (
      !tab ||
      !tab.url ||
      (tab.url.indexOf('http:') == -1 && tab.url.indexOf('https:') == -1) ||
      tab.url.indexOf('chrome://') !== -1 ||
      tab.url.indexOf('chrome-extension://') !== -1
    )
      return false;
    return true;
  }

  isInBlackList(domain) {
    if (setting_black_list !== undefined && setting_black_list.length > 0)
      return (
        setting_black_list.find((o) =>
          isDomainEquals(this.extractHostname(o), this.extractHostname(domain))
        ) !== undefined
      );
    else return false;
  }

  isInWhitelist(domain) {
    var hostname;

    if (domain.indexOf('//') > -1) {
      hostname = domain.split('/')[2];
    } else {
      hostname = domain.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    const whitelist = [
      'anp.nl',
      'barneveldsekrant.nl',
      'rd.nl',
      'fd.nl',
      'bnr.nl',
      'limburger.nl',
      'frieschdagblad.nl',
      'lc.nl',
      'dvhn.nl',
      'nd.nl',
      'nrc.nl',
      'ad.nl',
      'parool.nl',
      'trouw.nl',
      'volkskrant.nl',
      'bndestem.nl',
      'bd.nl',
      'ed.nl',
      'gelderlander.nl',
      'pzc.nl',
      'destentor.nl',
      'tubantia.nl',
      'nu.nl',
      'rtlnieuws.nl',
      'telegraaf.nl',
      'gooieneemlander.nl',
      'haarlemsdagblad.nl',
      'noordhollandsdagblad.nl',
      'leidschdagblad.nl',
      'ijmuidercourant.nl',
      'vn.nl',
      'groene.nl',
      'decorrespondent.nl',
      'nos.nl',
      'twitter.com',
      'instagram.com',
      'facebook.com',
      'linkedin.com'
    ];

    return whitelist.find((o) => isDomainEquals(o, hostname)) !== undefined;
  }

  isLimitExceeded(domain, tab) {
    if (
      setting_restriction_list !== undefined &&
      setting_restriction_list.length > 0
    ) {
      var item = setting_restriction_list.find((o) =>
        isDomainEquals(
          this.extractHostname(o.domain),
          this.extractHostname(domain)
        )
      );
      if (item !== undefined) {
        var today = new Date().toLocaleDateString('en-US');
        var data = tab.days.find((x) => x.date == today);
        if (data !== undefined) {
          var todayTimeUse = data.summary;
          if (todayTimeUse >= item.time) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isNewUrl(domain) {
    if (tabs.length > 0)
      return tabs.find((o) => o.url === domain) === undefined;
    else return true;
  }

  getTab(domain) {
    if (tabs !== undefined) return tabs.find((o) => o.url === domain);
  }

  extractHostname(url) {
    var hostname;

    // if (url.indexOf('//') > -1) {
    //   hostname = url.split('/')[2];
    // } else {
    //   hostname = url.split('/')[0];
    // }

    // hostname = hostname.split(':')[0];
    // hostname = hostname.split('?')[0];
    hostname = url;

    return hostname;
  }

  updateFavicon(tab) {
    var domain = this.extractHostname(tab.url);
    var currentTab = this.getTab(domain);
    if (currentTab !== null && currentTab !== undefined) {
      if (
        tab.favIconUrl !== undefined &&
        tab.favIconUrl !== currentTab.favicon
      ) {
        currentTab.favicon = tab.favIconUrl;
      }
    }
  }

  setCurrentActiveTab(domain) {
    this.closeIntervalForCurrentTab();
    currentTab = domain;
    this.addTimeInterval(domain);
  }

  clearCurrentActiveTab() {
    this.closeIntervalForCurrentTab();
    currentTab = '';
  }

  addTimeInterval(domain) {
    var item = timeIntervalList.find(
      (o) =>
        o.domain === domain && o.day == new Date().toLocaleDateString('en-US')
    );
    if (item != undefined) {
      if (item.day == new Date().toLocaleDateString('en-US'))
        item.addInterval();
      else {
        var newInterval = new TimeInterval(
          new Date().toLocaleDateString('en-US'),
          domain
        );
        newInterval.addInterval();
        timeIntervalList.push(newInterval);
      }
    } else {
      var newInterval = new TimeInterval(
        new Date().toLocaleDateString('en-US'),
        domain
      );
      newInterval.addInterval();
      timeIntervalList.push(newInterval);
    }
  }

  closeIntervalForCurrentTab() {
    if (currentTab !== '' && timeIntervalList != undefined) {
      var item = timeIntervalList.find(
        (o) =>
          o.domain === currentTab &&
          o.day == new Date().toLocaleDateString('en-US')
      );
      if (item != undefined) item.closeInterval();
    }
    currentTab = '';
  }

  isNeedNotifyView(domain, tab) {
    if (
      setting_notification_list !== undefined &&
      setting_notification_list.length > 0
    ) {
      var item = setting_notification_list.find((o) =>
        isDomainEquals(
          this.extractHostname(o.domain),
          this.extractHostname(domain)
        )
      );
      if (item !== undefined) {
        var today = new Date().toLocaleDateString('en-US');
        var data = tab.days.find((x) => x.date == today);
        if (data !== undefined) {
          var todayTimeUse = data.summary;
          if (todayTimeUse == item.time || todayTimeUse % item.time == 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
