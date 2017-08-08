Available here on S3:  https://s3-eu-west-1.amazonaws.com/ft-ig-content-prod/v2/ft-interactive/germany-2017-seatcalculator/master/index.html

A simple example of how to make and publish data-generated static graphics via the same pattern as starter kit.

# What happens?

There's a [node script](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/index.js) which runs on ["npm run build"](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/package.json#L8) and puts a `pie.svg` in a `dist` folder

The using [ft-graphics-deploy](https://www.npmjs.com/package/ft-graphics-deploy) via ["npm run deploy"](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/package.json#L10) the contents of the `dist` folder are put in our s3 bucket.

The order in which Circle CI runs the build and deploy scripts is set in the [circle config file](https://github.com/ft-interactive/example-static-graphic-maker/blob/master/.circleci/config.yml)

The deployed URL is shown in the circle CI output logs.
