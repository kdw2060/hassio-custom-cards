import { LitElement, css } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

//Global vars
let cardTitle;
let grocyApiWrapperUrl;
let tasksDiv = '<p class="loading">Loading tasks</p>';
let choresDiv = '<p class="loading">Loading chores</p>';
let users = [];
let tasks = [];
let taskCategories = [];
let chores = [];
let choresTrackInfo = [];
let cardHtml;
const taskHtmlTemplate = `
  <article id="article" class="media task">
    <figure class="media-left">
      <p class="image is-48x48">
        <svg style="width:48px;height:28px" viewBox="0 0 24 24">
        <path fill="#000000" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
        </svg>
      </p>
      <p class="has-text-centered">{%user%}</p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h3 class="title is-5">{%name%}</h3>
        <p class="subtitle is-6">
          To do at/by: {%due_date%}
        </p>
      </div>
      <nav class="level is-mobile">
        <div class="level-left">
          <a class="level-item">
            <button class="button is-small is-success is-task-button" data="{%id%}">Mark Done</button>
          </a>
        </div>
      </nav>
    </div>
  </article>
`;
const choreHtmlTemplate = `
  <article class="media task">
    <figure class="media-left">
      <p class="image is-48x48">
        <svg style="width:48px;height:28px" viewBox="0 0 24 24">
        <path fill="#000000" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
        </svg>
      </p>
      <p class="has-text-centered">{%user%}</p>
    </figure>
    <div class="media-content">
      <div class="content">
        <h3 class="title is-5">{%name%}</h3>
        <p class="subtitle is-6">
          Schedule: {%period%} | Due next: {%next_date%}
        </p>
      </div>
      <nav class="level is-mobile">
        <div class="level-left">
          <a class="level-item">
            <button class="button is-small is-success is-track-button" data-id="{%id%}" data-user-id="{%user_id%}">Track</button>
          </a>
          <span class="level-item is-size-7">
            (last tracked: {%last_tracked%})
          </span>
        </div>
      </nav>
    </div>
  </article>
`;
function fillTemplate(template, object) {
  let output = template.replace(/{%name%}/g, object.name);
  output = output.replace(/{%id%}/g, object.id);
  output = output.replace(/{%user%}/g, object.user);
  output = output.replace(/{%user_id%}/g, object.user_id);
  output = output.replace(/{%due_date%}/g, object.due_date);
  output = output.replace(/{%done_date%}/g, object.done_timestamp);
  output = output.replace(/{%period%}/g, object.period);
  output = output.replace(/{%last_tracked%}/g, object.last_tracked);
  output = output.replace(/{%next_date%}/g, object.next_date);
  return output;
}
//API fetch functions
function getTasks() {
  return fetch(grocyApiWrapperUrl + "/loadTasks")
    .then(response => response.json())
    .then(responseData => {return responseData;})
    .catch(function(error) {console.log(error);});
};
function getTaskCategories() {
  return fetch(grocyApiWrapperUrl +"/loadTaskCategories")
    .then(response => response.json())
    .then(responseData => {return responseData;})
    .catch(function(error) {console.log(error); });
}
function getChores() {
  return fetch(grocyApiWrapperUrl + "/loadChores")
    .then(response => response.json())
    .then(responseData => {return responseData;})
    .catch(function(error) {console.log(error);});
}
function getChoreTrackInfo() {
  return fetch(grocyApiWrapperUrl + "/loadChoreTrackInfo")
    .then(response => response.json())
    .then(responseData => {return responseData;})
    .catch(function(error) {console.log(error);});
}
function getUsers() {
  return fetch(grocyApiWrapperUrl + "/loadUsers")
    .then(response => response.json())
    .then(responseData => {return responseData;})
    .catch(function(error) {console.log(error);});
}

class GrocyChoresTasksCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }
  render() {
    function processData() {
      getUsers().then(function(data) {
        users = [];
        for (let i = 0; i < data.length; i++) {
          let user = { id: data[i].id, name: data[i].display_name };
          users.push(user);
        }
      });
      getTaskCategories().then(function(data) {
        taskCategories = [];
        for (let i = 0; i < data.length; i++) {
          let taskCategory = { id: data[i].id, name: data[i].name };
          taskCategories.push(taskCategory);
        }
      });
      getTasks().then(function(data) {
        if (data.length > 0) {
          tasks = [];
          for (let i = 0; i < data.length; i++) {
            let task = {
              id: data[i].id,
              name: data[i].name,
              user: data[i].assigned_to_user_id,
              category_id: data[i].category_id,
              done: data[i].done,
              done_timestamp: data[i].done_timestamp,
              due_date: data[i].due_date
            };
            for (let n = 0; n < users.length; n++) {
              if (task.user === users[n].id) {
                task.user = users[n].name;
              }
            }
            if (task.done_timestamp === null) {
              task.done_timestamp = "";
            }
            tasks.push(task);
          }
          tasksDiv = tasks.map(el => fillTemplate(taskHtmlTemplate, el)).join("");
        } else {
          tasksDiv = "No tasks";
        }
      });
      getChoreTrackInfo().then(function(data) {
        choresTrackInfo = data;
        getChores().then(function(data) {
          let chore;
          if (data.length > 0) {
            chores = [];
            for (let i = 0; i < data.length; i++) {
              chore = {
                id: data[i].id,
                name: data[i].name,
                user: data[i].assignment_config,
                user_id: data[i].assignment_config,
                period: data[i].period_type
              };

              for (let n = 0; n < users.length; n++) {
                if (chore.user === users[n].id) {
                  chore.user = users[n].name;
                } else {
                  chore.user = "anybody";
                }
              }

              for (let l = 0; l < choresTrackInfo.length; l++) {
                if (choresTrackInfo[l].chore_id === chore.id) {
                  if (choresTrackInfo[l].last_tracked_time) {
                    chore.last_tracked = choresTrackInfo[l].last_tracked_time.slice(0, 10);
                  }
                  if (choresTrackInfo[l].last_tracked_time === null) {
                    chore.last_tracked = "";
                  }
                  if (choresTrackInfo[l].next_estimated_execution_time) {
                    chore.next_date = choresTrackInfo[l].next_estimated_execution_time.slice(0, 10);
                  }
                }
              }
              chores.push(chore);
            }
            choresDiv = chores.map(el => fillTemplate(choreHtmlTemplate, el)).join("");
          } else {
            choresDiv = "No chores";
          }
        });
      });

      cardHtml =
        `
      <ha-card>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css">
        <div id="title" class="cardHeader">` +
        cardTitle +
        `</div>
        <div class="container">
          <div>` +
        tasksDiv +
        choresDiv +
        `</div>
        </div>
      </ha-card>
      `;
    }

    processData();
    this.shadowRoot.innerHTML = cardHtml;
    //Event listeners for buttons
    if (this.shadowRoot.getElementById("article")) {
      let className = this.shadowRoot.querySelectorAll(".is-task-button");
      var markTaskDone = function() {
        let id = this.getAttribute("data");
        fetch(grocyApiWrapperUrl + "/taskDone?id=" + id , { method: "POST" })
          .then(response => {if (response.ok) {console.log("task done POST done");}})
          .catch(function(error) {console.log(error);})
  
        let refresh = fetch(grocyApiWrapperUrl + '/refreshAll');
        if (refresh.ok) {console.log('refreshAll executed');}
      };
      Array.from(className).forEach(function(element) {
        element.addEventListener("click", markTaskDone);
      });

      let className2 = this.shadowRoot.querySelectorAll(".is-track-button");
      var trackChore = function() {
        let id = this.getAttribute("data-id");
        let user = this.getAttribute("data-user-id");
        fetch(grocyApiWrapperUrl + "/trackChore?id=" + id + '&user=' + user, {method: "POST"})
          .then(response => {if (response.ok) {console.log("track chore POST done");}})
          .catch(function(error) {console.log(error);})

      Array.from(className2).forEach(function(element) {
        element.addEventListener("click", trackChore);
      });
      // not implemented, would require using /objects/tasks api request for showing the finished tasks as well
      // taskUndo(id) {
      //   fetch( grocyApiUrl + '/api/tasks/'+ id + '/undo')
      //       .then(response => console.log(response)
      //       .catch(function(error){
      //       console.log(error);
      //       }))
      // };
    }
    }
    console.log("render loop done");
  }

  setConfig(config) {
    if (!config.grocyApiWrapperUrl) {
      throw new Error("Please define Grocy api url");
    }
    this.config = config;
    cardTitle = this.config.title;
    grocyApiWrapperUrl = this.config.grocyApiWrapperUrl;
  }
  //https://codepen.io/vkjgr/pen/gbPaVx (css loading animation)
  static get styles() {
    return css`
      .loading:after {
        content: " .";
        animation: dots 1s steps(5, end) infinite;
      }
      @keyframes dots {
        0%,
        20% {
          color: white;
          text-shadow: 0.25em 0 0 black, 0.5em 0 0 black;
        }
        40% {
          color: black;
          text-shadow: 0.25em 0 0 white, 0.5em 0 0 black;
        }
        60% {
          text-shadow: 0.25em 0 0 black, 0.5em 0 0 white;
        }
        80%,
        100% {
          text-shadow: 0.25em 0 0 black, 0.5em 0 0 black;
        }
      }
      button {
        padding-bottom: 0.1em !important;
        padding-top: 0.1em !important;
        font-size: 0.8rem !important;
      }
      ha-card {
        padding: 1em 0.5em 0.5em 0.5em;
      }
      .cardHeader {
        margin-bottom: 0.5em;
      }
    `;
  }
  getCardSize() {
    return 3;
  }
}
customElements.define("grocy-chores-tasks", GrocyChoresTasksCard);
