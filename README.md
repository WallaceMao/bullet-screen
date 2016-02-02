bullet-screen
====

Bullet screen component written in native javascript.

demo
----

[basic example](./examples/basic.html)

useage
----

        walletScreen.init({
            elementId: 'bulletScreen',  //
            trackCount: 3,
            speed: 100,
            initData: [
                {text: 'welcome to my bullet-screen!'},
                {text: '欢迎来到我的弹幕！'},
                {text: 'Herzlich Willkommen!'},
                {text: 'Добро пожаловать'},
                {text: 'Bienvenue'},
                {text: 'ようこそ'},
                {text: '환영 합니다'}
            ]
        });        
        
### properties

#### elementId (String, required)

The id of the html element where you want to render your bullet screen.

#### trackCount (Integer, optional, default 3)

The track count you want to add in the screen.

#### speed (Double, optional, default 100)

The move speed of the bullets. The unit is in "px/s".

#### initData (Array, optional, default empty array)

The initialized data to show on the screen. The json object in Array must have at least  one field called "text" whose will be used to display on the screen. You can also add bullets arrived from back end with the method "add".

### methods

#### add([]|{})

Add single json object or array of json objects to bullet screen. The json ojbect added must have at least one field called "text" whose value will be used to display on the screen. Commonly, the json object or array would be fetched from back end queue.

LICENSE
---

## License

[MIT](./LICENSE)

### more functions and front-back end integrated examples
### to be continued...
