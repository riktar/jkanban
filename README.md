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

## Example

#### Empty Kanban
This snippet create an empty Kanban Board

```
<div id="myKanban"></div>

<script>
    var kanban = new jKanban({element : '#myKanban'})
</script>
```
#### Kanban with default board
For define board to our kanban, you can use the option `boards` when you init the object.

```
<div id="myKanban"></div>

<script>
    var kanban = new jKanban({
        element : '#myKanban',
        boards  :[
                    {
                        'id' : '_todo',
                        'title'  : 'To Do',
                        'class' : 'info',
                        'item'  : [
                            {
                                'id':'_item1',
                                'title':'My Task Test'
                            },
                            {
                                'id':'_item2',
                                'title':'Buy Milk',
                            }
                        ]
                    }
                 ]
    })
</script>
```
## I'm still working on the doc!

## Develop
Clone the repo then use `npm install` for download all the dependencies then launch `npm run build` for build the project

### Pull Requests? 
I'd love them!

### Comments?
Let's hear them! (The nice ones please!)


### Me? 
In case you're interested I'm [@riktarweb](http://twitter.com/riktarweb)