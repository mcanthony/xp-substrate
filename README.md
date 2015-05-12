# &lt;xp-substrate&gt;

> Substrate experiment

## Demo

[Check it live!](http://dmmn.github.io/xp-substrate)

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install xp-substrate --save
```

Or [download as ZIP](https://github.com/dmmn/xp-substrate/archive/master.zip).

## Usage

1. Import Web Components' polyfill:

    ```html
    <script src="bower_components/webcomponentsjs/webcomponents.min.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="bower_components/xp-substrate/src/xp-substrate.html">
    ```

3. Start using it!

    ```html
    <xp-substrate></xp-substrate>
    ```

## Options

Attribute     | Options     | Default      | Description
---           | ---         | ---          | ---
`foo`         | *string*    | `bar`        | Lorem ipsum dolor.

## Methods

Method        | Parameters   | Returns     | Description
---           | ---          | ---         | ---
`unicorn()`   | None.        | Nothing.    | Magic stuff appears.

## Events

Event         | Description
---           | ---
`onsomething` | Triggers when something happens.

## Development

In order to run it locally you'll need to fetch some dependencies.

* Install [Bower](http://bower.io/):

    ```sh
    $ [sudo] npm install -g bower
    ```

* Install local dependencies:

    ```sh
    $ bower install
    ```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

For detailed changelog, check [Releases](https://github.com/dmmn/xp-substrate/releases).

## License

[MIT License](http://opensource.org/licenses/MIT)
