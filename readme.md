
A simple example of how to make and publish data-generated static graphics via the same pattern as starter kit.

# What happens?

There's a [node script](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/index.js) which runs on ["npm run build"](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/package.json#L8) and puts a generated SVG file in a `dist` folder.

For this repo to run it needs to pull in the latest poll data so, run `npm run build:dotenv` to access the data.

It generates a dated version of the chart, a latest version that will be overwritten. Both in small and medium sizes. All available charts should be visible on the generated index page. 

The using [ft-graphics-deploy](https://www.npmjs.com/package/ft-graphics-deploy) via ["npm run deploy"](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/package.json#L10) the contents of the `dist` folder are put in our s3 bucket.

The order in which Circle CI runs the build and deploy scripts is set in the [circle config file](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/.circleci/config.yml)

The deployed URL is shown in the circle CI output logs.
