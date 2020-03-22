class BarometerGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    } 
      
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    if (!cardConfig.scale) cardConfig.scale = "50px";
    cardConfig.min = 960;
    cardConfig.max = 1060;
    const apitoken = cardConfig.apitoken;
    const apiBaseUrl = cardConfig.apiBaseUrl;
    let minmaxhistory = cardConfig.minmaxhistory;
    let needleBool = cardConfig.needle;
      
    function getMax(arr, prop) {
        var max;
        for (var i=0 ; i<arr.length ; i++) {
            if (!max || parseFloat(arr[i][prop]) > parseFloat(max[prop]))
            max = arr[i];
            }
        return max;
            };
    function getMin(arr, prop) {
        var min;
        for (var i=0 ; i<arr.length ; i++) {
        if (!min || parseFloat(arr[i][prop]) < parseFloat(min[prop]))
            min = arr[i];
            }
        return min;
            };
    const headers = { Authorization: `Bearer ${apitoken}`, };
    let now = new Date;
    let nowIso = now.toISOString();
    let notnow = new Date(new Date().setDate(new Date().getDate()-minmaxhistory));
    let notnowIso = notnow.toISOString();
    
    function getApiData() {
    return fetch(apiBaseUrl + '/api/history/period/'+ notnowIso + '?filter_entity_id=' + cardConfig.entity + '&end_time=' + nowIso, { headers })
        .then(response => response.json())
        .then((responseData) => {return responseData;})
        .catch(function(error){console.log(error);})      
    }
    
    getApiData().then(function(data){
        let historicSensorStates = data;
        let maxval = parseFloat(getMax(historicSensorStates[0], "state").state);
        let minval = parseFloat(getMin(historicSensorStates[0], "state").state);
        function translateTurn(value) {
            return 5 * (value - 960) / (1060 - 960)
        }
        const turn2 = (translateTurn(minval) /10) + 0.01;
        const turn3 = (translateTurn(maxval) /10) + 0.01;
        root.getElementById("recentMin").style.transform = `rotate(${turn2}turn)`;
        root.getElementById("recentMax").style.transform = `rotate(${turn3}turn)`;
        root.getElementById("recentMinVal").innerHTML = minval;
        root.getElementById("recentMaxVal").innerHTML = maxval;
    });
    
      
    const entityParts = this._splitEntityAndAttribute(cardConfig.entity);
    cardConfig.entity = entityParts.entity;
    if (entityParts.attribute) cardConfig.attribute = entityParts.attribute;

    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        --base-unit: ${cardConfig.scale};
        height: calc(var(--base-unit)*3.5);
        position: relative;
      }
      .container{
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2.44);
        position: absolute;
        top: calc(var(--base-unit)*2);
        left: 50%;
        overflow: hidden;
        text-align: center;
        transform: translate(-50%, -50%);
      }
      .gauge-a{
        z-index: 1;
        position: absolute;
        background-color: var(--primary-background-color);
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2);
        top: 0%;
        border-radius:calc(var(--base-unit) * 2.5) calc(var(--base-unit) * 2.5) 0px 0px ;
      }
      .gauge-b{
        z-index: 3;
        position: absolute;
        background-color: var(--paper-card-background-color);
        width: calc(var(--base-unit) * 3.5);
        height: calc(var(--base-unit) * 2);
        top: calc(var(--base-unit) * .25);
        margin-left: calc(var(--base-unit) * 0.25);
        margin-right: auto;
        border-radius: calc(var(--base-unit) * 3.5) calc(var(--base-unit) * 3.5) 0px 0px ;
      }
      .gauge-c{
        z-index: 2;
        position: absolute;
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2);
        top: calc(var(--base-unit) * 2);
        margin-left: auto;
        margin-right: auto;
        border-radius: 0px 0px calc(var(--base-unit) * 2) calc(var(--base-unit) * 2) ;
        transform-origin: center top;
        transition: all 1.3s ease-in-out;
      }
      .gauge-data{
        z-index: 4;
        color: var(--primary-text-color);
        line-height: calc(var(--base-unit) * 0.3);
        position: absolute;
        width: calc(var(--base-unit) * 4);
        height: calc(var(--base-unit) * 2.1);
        top: calc(var(--base-unit) * 1.25);
        margin-left: auto;
        margin-right: auto;
        transition: all 1s ease-out;
      }
      .gauge-data #percent{
        font-size: calc(var(--base-unit) * 0.55);
      }
      .gauge-data #title{
        padding-top: calc(var(--base-unit) * 0.15);
        font-size: calc(var(--base-unit) * 0.30);
      }
      #gauge-icons{
            width: calc(var(--base-unit) * 4);
            height: calc(var(--base-unit) * 2.5);
            text-align: center;
            margin: 0 auto;
        }
      .weathericon-pouring{
            float: left;
            padding-top: 3em;
        }
      .weathericon-partly-cloudy{
            padding-top: .5em;
        }
      .weathericon-sunny{
            float: right;
            padding-top: 3em;
        }
      .gauge-footer{
            position: absolute;
            width: calc(var(--base-unit) *4);
            height: calc(var(--base-unit) *.75);
            top: calc(var(--base-unit) *2);
            z-index: 4;
            font-size: calc(var(--base-unit) * 0.30);
            font-weight: 400;
            padding-top: .25em;
            background: #ffffff;
        }
      .gauge-footer .minval{
            float: left;
            color: #797575;
        }
      .gauge-footer .maxval{
            float: right;
            color: #797575;
        }
      #needle {
        visibility: hidden;
        overflow: visible;
        fill: var(--label-badge-yellow);
        transform: translateY(-5px);     
        }
      .gauge-d{
        z-index: 3;
        position: absolute;
        width: calc(var(--base-unit) * 4);
        height: 0;
        top: calc(var(--base-unit) * 2);
        margin-left: auto;
        margin-right: auto;
        border-radius: 0px 0px calc(var(--base-unit) * 2) calc(var(--base-unit) * 2) ;
        transform-origin: center top;
        transition: all 1.3s ease-in-out;
        transform: rotate(45deg);
      }
      .gauge-d svg, .gauge-e svg {
          float: left;
        }
      .gauge-e{
        z-index: 3;
        position: absolute;
        width: calc(var(--base-unit) * 4);
        height: 0;
        top: calc(var(--base-unit) * 2);
        margin-left: auto;
        margin-right: auto;
        border-radius: 0px 0px calc(var(--base-unit) * 2) calc(var(--base-unit) * 2) ;
        transform-origin: center top;
        transition: all 1.3s ease-in-out;
        transform: rotate(125deg);
      }
      #recentMinVal, #recentMaxVal {
        position: absolute;
        background: rgba(0, 0, 0, 0.05);
        margin-top: -.55em;
        left: .5em;
        transform: rotate(-90deg);
        opacity: 0;
        }
    `;
    content.innerHTML = `
    <div id="gauge-icons">
        <svg class="weathericon-pouring" style="width: 18px;height: 18px;" viewBox="0 0 24 24">
    <path fill="#607D8B" d="M9,12C9.53,12.14 9.85,12.69 9.71,13.22L8.41,18.05C8.27,18.59 7.72,18.9 7.19,18.76C6.65,18.62 6.34,18.07 6.5,17.54L7.78,12.71C7.92,12.17 8.47,11.86 9,12M13,12C13.53,12.14 13.85,12.69 13.71,13.22L11.64,20.95C11.5,21.5 10.95,21.8 10.41,21.66C9.88,21.5 9.56,20.97 9.7,20.43L11.78,12.71C11.92,12.17 12.47,11.86 13,12M17,12C17.53,12.14 17.85,12.69 17.71,13.22L16.41,18.05C16.27,18.59 15.72,18.9 15.19,18.76C14.65,18.62 14.34,18.07 14.5,17.54L15.78,12.71C15.92,12.17 16.47,11.86 17,12M17,10V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,12.11 3.6,13.08 4.5,13.6V13.59C5,13.87 5.14,14.5 4.87,14.96C4.59,15.43 4,15.6 3.5,15.32V15.33C2,14.47 1,12.85 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12C23,13.5 22.2,14.77 21,15.46V15.46C20.5,15.73 19.91,15.57 19.63,15.09C19.36,14.61 19.5,14 20,13.72V13.73C20.6,13.39 21,12.74 21,12A2,2 0 0,0 19,10H17Z"></path>
        </svg>
        <svg class="weathericon-partly-cloudy" style="width: 18px;height: 18px;" viewBox="0 0 24 24">
    <path fill="#607D8B" d="M12.74,5.47C15.1,6.5 16.35,9.03 15.92,11.46C17.19,12.56 18,14.19 18,16V16.17C18.31,16.06 18.65,16 19,16A3,3 0 0,1 22,19A3,3 0 0,1 19,22H6A4,4 0 0,1 2,18A4,4 0 0,1 6,14H6.27C5,12.45 4.6,10.24 5.5,8.26C6.72,5.5 9.97,4.24 12.74,5.47M11.93,7.3C10.16,6.5 8.09,7.31 7.31,9.07C6.85,10.09 6.93,11.22 7.41,12.13C8.5,10.83 10.16,10 12,10C12.7,10 13.38,10.12 14,10.34C13.94,9.06 13.18,7.86 11.93,7.3M13.55,3.64C13,3.4 12.45,3.23 11.88,3.12L14.37,1.82L15.27,4.71C14.76,4.29 14.19,3.93 13.55,3.64M6.09,4.44C5.6,4.79 5.17,5.19 4.8,5.63L4.91,2.82L7.87,3.5C7.25,3.71 6.65,4.03 6.09,4.44M18,9.71C17.91,9.12 17.78,8.55 17.59,8L19.97,9.5L17.92,11.73C18.03,11.08 18.05,10.4 18,9.71M3.04,11.3C3.11,11.9 3.24,12.47 3.43,13L1.06,11.5L3.1,9.28C3,9.93 2.97,10.61 3.04,11.3M19,18H16V16A4,4 0 0,0 12,12A4,4 0 0,0 8,16H6A2,2 0 0,0 4,18A2,2 0 0,0 6,20H19A1,1 0 0,0 20,19A1,1 0 0,0 19,18Z"></path>
        </svg>
        <svg class="weathericon-sunny" style="width: 18px;height: 18px;" viewBox="0 0 24 24">
    <path fill="#607D8B" d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z"></path>
        </svg>
    </div>
    <div class="container" id="container">
        <div class="gauge-a" id="gauge-a">
        </div>
        <div class="gauge-b"></div>
        <div class="gauge-c" id="gauge"><svg id="needle"><polygon points=" 105,15 115,0 0,5"></polygon></svg></div>
        <div class="gauge-d" id="recentMin"><span id='recentMinVal'></span><svg id='minpointer' height="24" width="24"><polygon points="9,9 2,20 0,0" style="fill:#039be5" /></svg></div>
        <div class="gauge-e" id="recentMax"><span id='recentMaxVal'></span><svg id='maxpointer' height="24" width="24"><polygon points="9,9 2,20 0,0" style="fill:#fd0a07" /></svg></div>
        <div class="gauge-data" id="gauge-data">
            <div id="percent"></div>
            <div id="title"></div>
        </div>
        <div class="gauge-footer">
            <span class="minval">960</span>
            <span class="maxval">1060</span>
        </div>
      </div>
    `;
    card.appendChild(content);
    card.appendChild(style);
    card.addEventListener('click', event => {
      this._fire('hass-more-info', { entityId: cardConfig.entity });
    });
    root.appendChild(card);
    this._config = cardConfig;
      
    if (needleBool === true) {
        root.getElementById("gauge-a").style.backgroundColor = '#dedede';
        root.getElementById("gauge").style.zIndex = '3';
        root.getElementById("gauge").style.backgroundColor = '#ffffff00';
        root.getElementById("needle").style.visibility = 'visible';
        root.getElementById("gauge-icons").style.paddingTop = '.15em';
        root.getElementById("percent").style.paddingTop = '2.5em';
        root.getElementById("gauge-data").style.zIndex = '7';
        root.getElementById("container").style.overflow = 'visible';
        card.style.height = 'calc(var(--base-unit)*4.4)';
    }
    if (needleBool !== true) {
      root.getElementById("gauge").style.backgroundColor = 'var(--label-badge-yellow)';
    }
    root.getElementById("minpointer").onmouseenter = function() {
        root.getElementById("recentMinVal").style.opacity = '1';
        console.log('mouseover');
        }
    root.getElementById("minpointer").onmouseleave = function() {
        root.getElementById("recentMinVal").style.opacity = '0';
        }
    root.getElementById("maxpointer").onmouseenter = function() {
        root.getElementById("recentMaxVal").style.opacity = '1';
        }
    root.getElementById("maxpointer").onmouseleave = function() {
        root.getElementById("recentMaxVal").style.opacity = '0';
        }
  }

  _splitEntityAndAttribute(entity) {
      let parts = entity.split('.');
      if (parts.length < 3) {
          return { entity: entity };
      }

      return { attribute: parts.pop(), entity: parts.join('.') };
  }

  _fire(type, detail, options) {
    const node = this.shadowRoot;
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
  }

  _translateTurn(value, config) {
    return 5 * (value - config.min) / (config.max - config.min)
  }

  _getEntityStateValue(entity, attribute) {
    if (!attribute) {
      return entity.state;
    }

    return entity.attributes[attribute];
  }

  set hass(hass) {
    const config = this._config;
    const entityState = this._getEntityStateValue(hass.states[config.entity], config.attribute);
    
    let measurement = "";
    if (config.measurement == null)
      measurement = hass.states[config.entity].attributes.unit_of_measurement;
    else
      measurement = config.measurement;

    const root = this.shadowRoot;
    if (entityState !== this._entityState) {
      root.getElementById("percent").textContent = `${entityState} ${measurement}`;
      root.getElementById("title").textContent = config.title;
      const turn = this._translateTurn(entityState, config) / 10;
      root.getElementById("gauge").style.transform = `rotate(${turn}turn)`;
    }
    root.lastChild.hass = hass;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('barometer-gauge-card', BarometerGaugeCard);
