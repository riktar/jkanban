# jKanban

> Javascript plugin for Kanban boards

jKanban allow you to create and manage Kanban Board in your project!

Please try out the live [demo][1]!

[1]: http://www.riccardotartaglia.it/jkanban/

## Install
Clone the repo and use the javascript and the css files in the `dist` folder.

You have to include

`<link rel="stylesheet" href="path/to/jkanban.min.css">`

and

`<script src="path/to/jkanban.min.js"></script>`

in your page and you are done.

## Usage
Init jKanban is a piece of cake!
### `var kanban = new jKanban(options)`

Here's an **overview of the default values**.
```js
var kanban = new jKanban({
    element          : '',                                           // selector of the kanban container
    gutter           : '15px',                                       // gutter of the board
    widthBoard       : '250px',                                      // width of the board
    responsivePercentage: false,                                    // if it is true I use percentage in the width of the boards and it is not necessary gutter and widthBoard
    dragItems        : true,                                         // if false, all items are not draggable
    boards           : [],                                           // json of boards
    dragBoards       : true,                                         // the boards are draggable, if false only item can be dragged
    itemAddOptions: {
        enabled: false,                                              // add a button to board for easy item creation
        content: '+',                                                // text or html content of the board button   
        class: 'kanban-title-button btn btn-default btn-xs',         // default class of the button
        footer: false                                                // position the button on footer
    },    
    itemHandleOptions: {
        enabled             : false,                                 // if board item handle is enabled or not
        handleClass         : "item_handle",                         // css class for your custom item handle
        customCssHandler    : "drag_handler",                        // when customHandler is undefined, jKanban will use this property to set main handler class
        customCssIconHandler: "drag_handler_icon",                   // when customHandler is undefined, jKanban will use this property to set main icon handler class. If you want, you can use font icon libraries here
        customHandler       : "<span class='item_handle'>+</span> %title% "  // your entirely customized handler. Use %title% to position item title 
                                                                             // any key's value included in item collection can be replaced with %key%
    },
    click            : function (el) {},                             // callback when any board's item are clicked
    context          : function (el, event) {},                      // callback when any board's item are right clicked
    dragEl           : function (el, source) {},                     // callback when any board's item are dragged
    dragendEl        : function (el) {},                             // callback when any board's item stop drag
    dropEl           : function (el, target, source, sibling) {},    // callback when any board's item drop in a board
    dragBoard        : function (el, source) {},                     // callback when any board stop drag
    dragendBoard     : function (el) {},                             // callback when any board stop drag
    buttonClick      : function(el, boardId) {},                     // callback when the board's button is clicked
    propagationHandlers: [],                                         // the specified callback does not cancel the browser event. possible values: "click", "context"
})
```

Now take a look to the `boards` object
```js
[
    {
        "id"    : "board-id-1",               // id of the board
        "title" : "Board Title",              // title of the board
        "class" : "class1,class2,...",        // css classes to add at the title
        "dragTo": ['another-board-id',...],   // array of ids of boards where items can be dropped (default: [])
        "item"  : [                           // item of this board
            {
                "id"    : "item-id-1",        // id of the item
                "title" : "Item 1"            // title of the item
                "class" : ["myClass",...]     // array of additional classes
            },
            {
                "id"    : "item-id-2",
                "title" : "Item 2"
            }
        ]
    },
    {
        "id"    : "board-id-2",
        "title" : "Board Title 2"
    }
]
```
 **WARNING: all ids are unique!**

### About custom properties
jKanban also support custom properties on items to improve your applications with html data- properties. You can define them at like:
```js
[
    {
        "id"    : "board-id-1",
        "title" : "Board Title",
        "item"  : [
            {
                "id"      : "item-id-1",
                "title"   : "Item 1",
                "username": "username1"
            },
            {
                "id"      : "item-id-2",
                "title"   : "Item 2",
                "username": "username2"
            }
        ]
    }
]
```
Which jKanban will convert to:
```html
<main class="kanban-drag">
    <div class="kanban-item" data-eid="item-id-1" data-username="username1">Item 1</div>
    <div class="kanban-item" data-eid="item-id-2" data-username="username2">Item 2</div>
</main>
```

## API
jKanban provides the easiest possible API to make your boards awesome!

Method Name           | Arguments                        | Description
----------------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------
`addElement`          | `boardID, element, position`     | Add `element` in the board with ID `boardID`, `element` is the standard format. If `position` is set, inserts at position starting from 0
`addForm`             | `boardID, formItem`              | Add `formItem` as html element into the board with ID `boardID`
`addBoards`           | `boards`                         | Add one or more boards in the kanban, `boards` are in the standard format
`findElement`         | `id`                             | Find board's item by `id`
`replaceElement`      | `id, element`                    | Replace item by `id` with `element` JSON standard format
`getParentBoardID`    | `id`                             | Get board ID of item `id` passed
`findBoard`           | `id`                             | Find board by `id`
`getBoardElements`    | `id`                             | Get all item of a board
`removeElement`       | `id`                             | Remove a board's element by id
`removeBoard`         | `id`                             | Remove a board by id

## Example
Clone the repo and look in the `example` folder

## Thanks
jKanban use [dragula](https://github.com/bevacqua/dragula) for drag&drop

## Develop
Clone the repo then use `npm install` for download all the dependencies then launch `npm run build` for build the project

### Pull Requests?
I'd love them!

### Comments?
Let's hear them! (The nice ones please!)

### Me?
In case you're interested I'm [@riktarweb](http://twitter.com/riktarweb)

