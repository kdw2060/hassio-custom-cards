# DEPRECATED

This card still works, but I've moved away from building custom add-ons and custom cards for a certain service.
Have a look at my [Api Consumer](https://github.com/kdw2060/hassio-addons/tree/master/hassio-addon-api-consumer) add-on instead. It has a sample consumer for the iRail service.

You can use a simple [markdown card](https://www.home-assistant.io/lovelace/markdown/) or the versatile [button card](https://github.com/custom-cards/button-card) to display the information in any way you like.

---

## nmbs-routeboard-card
A card to display the next trains leaving a Belgian train station for a given route. The info refreshes every minute.

| Standard (no styling) | Styled
| --- | ---
| ![not styled](custom%20nmbs%20card%20no%20styling.png "not styled") | ![styled](custom%20nmbs%20card.png "styled")

The card is deliberately unstyled, but all elements have css class attributes so you can style it as you wish with [Card Mod](https://github.com/thomasloven/lovelace-card-mod).
However, I have included the webfont I'm using in my personal style for you if you wish to use this as well. [Attribution for included font](https://www.fontsquirrel.com/license/BPdots)

### Installing
Upload all files to your custom cards folder of your home assistant instance. Add these lines to the resources section of your ui-lovelace.yaml (adapt the folder name if necessary, adapt the version number when upgrading):

```yaml
- url: /local/custom_cards/nmbs-routeboard-card.js?v=0.001
  type: js
```
Also include the webfont if you want to use it:
```yaml
- url: /local/custom_cards/nmbs-routeboard-stylesheet.css?v=0.001
  type: css
```

### Usage
Add a custom card in your lovelace yaml view and set its options. All options except 'show' are required.

Example configuration: 
```yaml
- type: "custom:nmbs-routeboard"
  departureStation: 'Antwerpen-Berchem'
  arrivalStation: 'Brussel-Centraal'
  lang: 'nl'
  show: 4
```

### Options

| Name | Type | Needed? | Value
| ---- | ---- | ------- | -----------
| type | string | **Required** | `custom:"nmbs-routeboard"`
| departureStation | string | **Required** | a station that's listed in https://api.irail.be/stations/
| arrivalStation | string | **Required** | a station that's listed in https://api.irail.be/stations/
| lang | string | **Required** | choose between `nl`, `fr`, `en`, `de`  (table header and station names will be translated)
| show | number (int) | optional | the amount of trains to show (min 1 - max 6)

### Styling:

You can address these elements and css classes:

| element or className | Description
| ---- | ----
| table | the `<table>` element
| th | the first row / header of the table
| tr | other table rows
| .cardHeader | the card title (your route)
| .tableContainer | can be used to style the background of the table
| .time |  first column of table row (`<tr>` element)
| .delay | a `<span>` element within the time column
| .platform | second column of table row (`<tr>` element)
| .platformNumber | a `<span>` element containing the track number
| .direction | third column of table row (`<tr>` element)


