# jKanban

>Javascript plugin for Kanban boards

[![Support](https://supporterhq.com/api/b/4y1kgkdiunojb7kr6t6iuozdb)](https://supporterhq.com/give/4y1kgkdiunojb7kr6t6iuozdb)

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
    element         : '',                           // selector of the kanban container
    gutter          : '15px',                       // gutter of the board
    widthBoard      : '250px',                      // width of the board
    boards          : [],                           // json of boards
    click           : function (el) {},             // callback when any board's item are clicked
    dragEl          : function (el, source) {},     // callback when any board's item are dragged
    dragendEl       : function (el) {},             // callback when any board's item stop drag
    dragBoard       : function (el, source) {},     // callback when any board stop drag
    dragendBoard    : function (el) {}              // callback when any board stop drag
})
```

Now take a look to the `boards` object
```js
[
    {
        "id"    : "board-id-1",             // id of the board
        "title" : "Board Title",            // title of the board
        "class" : "",                       // css class to add at the title
        "item"  : [                         // item of this board
            {
                "id"    : "item-id-1",      // id of the item
                "title" : "Item 1"          // title of the item
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
 
## API
jKanban provides the easiest possible API to make your boards awesome!

Method Name           | Arguments                        | Description
----------------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------
`addElement`          | `boardID, element`               | Add `element` in the board with ID `boardID`, `element` is the standard format 
`addBoards`           | `boards`                         | Add one or more boards in the kanban, `boards` are in the standard format
`findElement`         | `id`                             | Find board's item by `id`
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