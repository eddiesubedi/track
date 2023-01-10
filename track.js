// ==UserScript==
// @name         Track
// @namespace    Track
// @version      1.0.0
// @description  Track
// @author       Ed
// @match        https://animepahe.ru/*
// @match        https://kwik.cx/e/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// ==/UserScript==


(function () {
	if (location.hostname == "animepahe.com" || location.hostname == "animepahe.org" || location.hostname == "animepahe.ru") {
		animepahe();

	} else if (location.hostname == "kwik.cx") {
		kwik();
	}

  function animepahe() {
    var path = location.pathname;
    if(path == '/') {
      home();
    } else if(path.includes('play')) {
      episode();
    }
  }

  function home() {
    console.log('home');
    var data = GM_listValues();
    data = data.filter((key)=> Number.isInteger(Number(key)));
    data = data.map((key)=> {
      return GM_getValue(key);
    });

    data.sort(function(a,b){
      return new Date(b.updated) - new Date(a.updated);
    });

    data = data.map((anime)=> {
      // var anime = GM_getValue(key);
      console.log(anime.url,"***********");
      var html = `
        <a style="position: relative; color:white;" href="${anime.url}">
          <div style="position:absolute; width:100%; height:100%; background: linear-gradient(to bottom,rgba(0,0,0,0) 70%,rgba(0,0,0,0.75) 100%);"></div>
          <img src="${anime.poster}" style="width: 250px; height: 300px; object-fit: cover;"/>
          <p style="position: absolute; bottom: 0;text-shadow: 0 1px 2px #000,0 1px 2px #000; padding:15px;margin: 0;">${anime.title} - ${anime.episode}</p>
        </a>
      `
      return html.trim();
    })

    var resumeWatching = document.createElement("div");
    resumeWatching.id = "app";
    var html = `
      <h2>Resume Watching</h2>
      <div style="display:flex; gap: 10px 10px; flex-wrap: wrap;">
         ${data.join('')}
      </div>

    `
    resumeWatching.innerHTML = html;
    document.querySelector('.latest-release').prepend(resumeWatching);
  }

  function episode() {
    console.log('episode');

    var malId = document.querySelector('meta[name="myanimelist"]').content;
    var title = document.querySelector('h1 a').title;
    var episode = document.querySelector('h1').childNodes[2].textContent.replace(' - ','');
    var poster = document.querySelector('.rounded').src.replace(".th.",'.');
    var url = location.href;
    var vidUrl = '';
    var updated = new Date().toString();


    var targetNode = document.querySelector('iframe');
    var config = { attributes: true, childList: true };
    var videoPlayerLoaded = function(mutationsList) {
      vidUrl = document.querySelector('iframe').src;
      GM_deleteValue(malId);
      GM_setValue(malId, {malId,title,episode,poster,vidUrl, updated, url});

      window.setInterval(function getDuration() {
        var a = GM_getValue(vidUrl);
        if(typeof a != "undefined"){
          if(a.timeRemaning < 10) {
            var episodeList = [...document.querySelectorAll('#scrollArea .dropdown-item')];
            var nextEpisodeIndex = episodeList.indexOf(document.querySelector('#scrollArea .active'))+1;
            var nextEpisode = episodeList[nextEpisodeIndex];
            if(typeof episodeList[nextEpisodeIndex] != "undefined"){
              url = episodeList[nextEpisodeIndex].href;
              episode = document.querySelector('h1').childNodes[2].textContent.replace(' - ','');
              episode = Number(episode.trim())+1+"";
              GM_setValue(malId, {malId,title,episode,poster,vidUrl, updated, url});
            }
          }
        }

      }, 500);

      console.log(title, episode, vidUrl)
    }
    var observer = new MutationObserver(videoPlayerLoaded);
    observer.observe(targetNode, config);
  }



  function kwik() {
    var vid = document.querySelector('video');
    var currentTime = GM_getValue(location.href);
    if(typeof currentTime != "undefined"){
      vid.currentTime = currentTime.currentTime;
    }
    window.setInterval(function getDuration() {
      var currentTime = vid.currentTime;
      var duration = vid.duration;
      var timeRemaning = duration - currentTime;
      GM_setValue(location.href, {currentTime, timeRemaning})
    }, 500);
  }


  // function clearDB() {
  //   var data = GM_listValues();
  //   for (let index = 0; index < data.length; index++) {
  //     const key = data[index]
  //     GM_deleteValue(key);
  //   }
  // }

})();
