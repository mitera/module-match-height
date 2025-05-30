# module-match-height.js #

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Socket Badge](https://socket.dev/api/badge/npm/package/module-match-height)](https://socket.dev/npm/package/module-match-height)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/module-match-height/badge)](https://www.jsdelivr.com/package/npm/module-match-height)
[![npm](https://img.shields.io/npm/v/module-match-height.svg?logo=npm&logoColor=fff&label=npm)](https://www.npmjs.com/package/module-match-height)
[![npm downloads](https://img.shields.io/npm/dm/module-match-height.svg?style=flat-square)](https://www.npmjs.com/package/module-match-height)
[![yarn](https://img.shields.io/npm/v/module-match-height.svg?logo=yarn&logoColor=fff&label=yarn)](https://yarnpkg.com/package?name=module-match-height)

## *Inspired by:* jquery-match-height

> *matchHeight:* makes the height of all selected elements exactly equal

[Demo](#demo) - [Features](#features) - [Install](#install) - [Usage](#usage) - [Options](#options) - [Data API](#data-api)  
[Advanced Usage](#advanced-usage) - [Changelog](#changelog) - [License](#license)

### Demo

See the [module-match-height.js demo](https://codepen.io/mitera/pen/XWGpLRL).

[![module-match-height.js screenshot](https://github.com/mitera/module-match-height/blob/master/module-match-height.jpg)](https://github.com/mitera/module-match-height/archive/refs/heads/master.zip)

### Modern browsers

In the years since this library was originally developed there have been updates to CSS that can now achieve equal heights in many situations. If you only need to support modern browsers then consider using [CSS Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) and [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/) instead.

### Best practice

Use this library to match height of internal elements, like title or text of teasers

### Features

- match the heights for groups of elements automatically
- use the maximum height or define a specific target element
- anywhere on the page and anywhere in the DOM
- responsive (updates on window resize)
- row aware (handles floating elements and wrapping)
- accounts for `box-sizing` and mixed `padding`, `margin`, `border` values
- handles images and other media (updates after loading)
- easily removed when needed
- data attributes API
- tested in Edge, Chrome, Firefox

### Install

CDN via jsDelivr

    <script src="https://cdn.jsdelivr.net/npm/module-match-height@latest/dist/module-match-height.min.js" type="text/javascript"></script>

Download [module-match-height.js](https://github.com/mitera/module-match-height/blob/master/module-match-height.js) and include the script in your HTML file:

	<script src="module-match-height.js" type="text/javascript"></script>

You can also install using the package managers [NPM](https://www.npmjs.com/package/module-match-height).

    npm install module-match-height

modular code

    import MatchHeight from 'module-match-height'

### Usage

    new MatchHeight(document.body, {elements: '.item'});

	const containers = document.querySelectorAll(".items-container");
    containers.forEach((container) => {			
        new MatchHeight(document.body, {elements: '.item'});
    });

Where `options` is an optional parameter.   
See below for a description of the available options and defaults.

The above example will set all selected elements with the class `item` to the height of the tallest.  
If the items are on multiple rows, the items of each row will be set to the tallest of that row (see `byRow` option).

Call this on the event (the plugin will automatically update on window load).   
See the included [test.html](https://github.com/mitera/module-match-height/blob/master/test/test.html) for many working examples.

Also see the [Data API](#data-api) below for a simple, alternative inline usage.

### Options

The default `options` are:

    {
        elements: null,
        byRow: true,
        property: 'height',
        target: null,
        remove: null,
        attributeName: null,
        events: true,
        throttle: 80,
        beforeUpdate: null,
        afterUpdate: null
    }

Where:

- `elements` is an optional string containing one or more selectors to match against. This string must be a valid CSS selector string
- `byRow` is `true` or `false` to enable row detection
- `property` is the CSS property name to set (e.g. `'height'` or `'min-height'`)
- `target` is an optional element to use instead of the element with maximum height
- `remove` is an optional element/s to excluded
- `attributeName` is an optional for use custom attribute
- `events` is `true` or `false` to enable default events
- `throttle` milliseconds to executed resize event, default is `80`
- `beforeUpdate` is a custom method that starts before the height matching process
- `afterUpdate` is a custom method that starts after the height matching process

### Data API

Use the data attribute `data-mh="group-name"` or `data-match-height="group-name"` where `group-name` is an arbitrary string to identify which elements should be considered as a group.

	<div data-mh="my-group">My text</div>
	<div data-mh="my-group">Some other text</div>
	<div data-mh="my-other-group">Even more text</div>
	<div data-mh="my-other-group">The last bit of text</div>

All elements with the same group name will be set to the same height when the page is loaded, regardless of their position in the DOM, without any extra code required.

It's possible to use custom data attribute `data-same-height="group-name"`

    <div data-same-height="my-group">My text</div>
	<div data-same-height="my-group">Some other text</div>
	<div data-same-height="my-other-group">Even more text</div>
	<div data-same-height="my-other-group">The last bit of text</div>

    const containers = document.querySelectorAll(".data-api-items");
    containers.forEach((container) => {
        new MatchHeight(container, {attributeName: 'data-same-height'});
    });

Note that `byRow` will be enabled when using the data API, if you don't want this (or require other options) then use the alternative method above.

### Advanced Usage

There are some additional functions and properties you should know about:

#### Manually trigger an update

	window.dispatchEvent(new Event('resize'));

If you need to manually trigger an update of all currently set groups, for example if you've modified some content.

#### Row detection

You can toggle row detection by setting the `byRow` option, which defaults to `true`.  
It's also possible to use the row detection function at any time:

#### Custom target element

	const containers = document.querySelectorAll(".target-items");
    containers.forEach((container) => {			
        new MatchHeight(container, {elements: '.item-0, .item-2, .item-3', target: document.getElementById("target-item-1")});
    });

Will set all selected elements to the height of the first item with class `sidebar`.

#### Custom property

	const containers = document.querySelectorAll(".property-items");
    containers.forEach((container) => {			
        new MatchHeight(container, {elements: '.item', property: 'min-height'});
    });

This will set the `min-height` property instead of the `height` property.

Where `event` a event object (`DOMContentLoaded`, `resize`, `orientationchange`).

#### Throttling resize updates

By default, the `events` is throttled to execute at a maximum rate of once every `80ms`.
Decreasing the `throttle` option will update your layout quicker, appearing smoother during resize, at the expense of performance.
If you experience lagging or freezing during resize, you should increase the `throttle` option.

#### Manually apply match height

Manual apply, code for JavaScript framework/library (e.g. `vue`, `react` ...).

	var el = new MatchHeight(document.body, {elements: '.item'});
    ...
	el._apply();
    el._applyDataApi('data-match-height');
    el._applyDataApi('data-mh');
    el._applyAll();

#### Remove match height from elements

Reset inline style property

    var el = new MatchHeight(document.body, {elements: '.item'});
    ...
    el._remove();

#### Remove events from match height elements

Reset events

    var el = new MatchHeight(document.body, {elements: '.item'});
    ...
    el._unbind();

#### Callback events
Since matchHeight automatically handles updating the layout after certain window events, you can supply functions as global callbacks if you need to be notified.
Introduced new settings `beforeUpdate` and `afterUpdate` to allow custom logic to be executed before and after the height matching process. 

    beforeUpdate: function () {
        console.log('beforeUpdate action')
    },
    afterUpdate: function () {
        console.log('afterUpdate action')
    }
	
### Known limitations

#### CSS transitions and animations are not supported

You should ensure that there are no transitions or other animations that will delay the height changes of the elements you are matching, including any `transition: all` rules. Otherwise the plugin will produce unexpected results, as animations can't be accounted for.

### Vue3 Example:

    import MatchHeight from 'module-match-height';
    export default {
        name: 'Example',
        data: function () {
            return {
                matchHeight: new MatchHeight(document.body, {elements: '.item p'});
            }
        },
        beforeUnmount() {
            this.matchHeight._unbind();
        },
        mounted() {
            this.matchHeight._apply();
        },
        methods: {
            reMatch() {
                this.matchHeight._apply();
            }
        }
    }

### React Example:

    import MatchHeight from 'module-match-height';
    class MyComponent extends Component {
        matchHeight = new MatchHeight(document.body, {elements: '.item p'});
        componentDidMount() {
            this.matchHeight._apply();
        }
        componentWillUnmount() {
            this.matchHeight._unbind();
        }
        render() {
            return (
                ...
            );
        }
    }

### Not duplicate instance!

I suggest to assign element to a variable for not create multiple instances and events

    //Right solution
    var el = new MatchHeight(document.body, {elements: '.item'});
    ... json update
    el._apply();

    //Wrong solution
    new MatchHeight(document.body, {elements: '.item'});
    ... json update
    new MatchHeight(document.body, {elements: '.item'})._apply();

### Changelog

To see what's new or changed in the latest version, see the [changelog](https://github.com/mitera/module-match-height/blob/master/CHANGELOG.md)

### License

module-match-height.js is licensed under [The MIT License (MIT)](http://opensource.org/licenses/MIT)
<br/>Copyright (c) 2023 Simone Miterangelis

This license is also supplied with the release and source code.
<br/>As stated in the license, absolutely no warranty is provided.