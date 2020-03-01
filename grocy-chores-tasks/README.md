# Tasks and chores card for Grocy

This card exposes the Tasks and Chores you have set in Grocy and allows you to mark tasks as done and chores as executed/tracked.

![](chores-tasks-card.png)

## Installation and configuration

1. This card depends on the accompanying [Grocy api-wrapper]() I made, so make sure to install this first.
2. Copy the .js file to the config > www > custom_cards folder of Home Assistant (the folder path may be differten on your system)
3. Add these lines to your `ui-lovelace.yaml` file:
```
- url: /local/custom_cards/grocy-chores-tasks-card.js?v=0.001
  type: module
```
4. Include the card in a lovelace view:
```
cards:
  - type: custom:grocy-chores-tasks
    title: Title goes here
    grocyApiWrapperUrl: *api wrapper url including port* e.g. 'http://192.168.1.5:3003'
```

The card uses the Bulma css framework for the layout and some basic styling. As always you can make your own styles with card-mod.
