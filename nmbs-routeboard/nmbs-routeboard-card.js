// Attribution for included font: https://www.fontsquirrel.com/license/BPdots

class NMBSRouteBoardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
      
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    
    function getApiData() {
      return fetch('https://api.irail.be/connections/?from=' + cardConfig.departureStation + '&to=' + cardConfig.arrivalStation + '&format=json&lang='+ cardConfig.lang )
          .then(response => response.json())
          .then((responseData) => {
          return responseData;
          })
          .catch(function(error){
          console.log(error);
          })      
    }

    function processData() {
        getApiData().then(function(data){
        let table;
        if (cardConfig.lang == 'nl') {
            table = `
            <tr>
                <th>Vertrek</th>
                <th>Spoor</th>
                <th>Richting</th>
                <th>Vertraging</th>
            </tr>
            `
            }
        if (cardConfig.lang == 'fr') {
            table = `
            <tr>
                <th>Départ</th>
                <th>Voie</th>
                <th>Direction</th>
                <th>Délai</th>
            </tr>
            `
            }
        if (cardConfig.lang == 'en') {
            table = `
            <tr>
                <th>Departure</th>
                <th>Track</th>
                <th>Direction</th>
                <th>Delay</th>
            </tr>
            `
            }
        if (cardConfig.lang == 'de') {
            table = `
            <tr>
                <th>Abfahrt</th>
                <th>Gleis</th>
                <th>Bestimmungsort</th>
                <th>Verspätung</th>
            </tr>
            `
            }
        for (let i=0 ; i < data.connection.length ; i++) {
          let scheduledTime = new Date(data.connection[i].departure.time * 1000);
          let hours = scheduledTime.getHours();
          let minutes = scheduledTime.getMinutes();
          let platform = data.connection[i].departure.platform;
          let direction = data.connection[i].arrival.direction.name;
          let delay = data.connection[i].departure.delay;
          let delayString;
          if (delay == 0) {delayString = '';}
          else {delay = delay / 60; delayString = delay + "'";}

          let row = '<tr><td class="time">'+ hours + ':' + minutes + '</td><td class="platform"><span class="platformNumber">' + platform + '</span></td><td class="direction">' + direction + '</td><td class="delay">' + delayString + '</td></tr>';

          table = table + row;
        }
        root.getElementById("trains").innerHTML = table;
        root.getElementById("title").innerHTML = cardConfig.departureStation + " - " + cardConfig.arrivalStation;
        });
        
    }
    processData();
    setInterval(processData, 60000);
    
    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    content.innerHTML = `
    <div id="title" class="card-header"></div>
    <div class="container">
      <div class="tableContainer">
        <table id="trains"></table>
      </div>
    </div>
    `;
    card.appendChild(content);
    root.appendChild(card);
    this._config = cardConfig;    
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;
    root.lastChild.hass = hass;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('nmbs-routeboard', NMBSRouteBoardCard);
