import { rm } from 'node:fs/promises';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';

const compileSass = gulpSass(dartSass);
const server = browserSync.create();
let development = false;

function clean() {
  // dist zawiera wyłącznie pliki generowane podczas budowania.
  return rm(new URL('./dist/', import.meta.url), { recursive: true, force: true });
}

export function assets() {
  // Gulp 5 domyślnie czyta UTF-8; obrazy muszą pozostać danymi binarnymi.
  return gulp.src('src/assets/**/*', { encoding: false })
    .pipe(gulp.dest('dist/assets'));
}

export function html() {
  return gulp.src('src/content/**/*.html').pipe(gulp.dest('dist'));
}

export function pwa() {
  return gulp.src('src/pwa/**/*', { encoding: false }).pipe(gulp.dest('dist'));
}

export function robots() {
  return gulp.src('robots.txt').pipe(gulp.dest('dist'));
}

export function js() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig({}, {
      mode: development ? 'development' : 'production'
    }));

    compiler.run((error, stats) => {
      compiler.close(closeError => {
        if (error || closeError) {
          reject(error || closeError);
        } else if (stats.hasErrors()) {
          reject(new Error(stats.toString({ all: false, errors: true })));
        } else {
          if (stats.hasWarnings()) {
            console.warn(stats.toString({ all: false, warnings: true }));
          }
          resolve();
        }
      });
    });
  });
}

export function sass() {
  const compiler = compileSass({ style: development ? 'expanded' : 'compressed' });

  // Watch ma działać po błędzie SCSS; build musi zakończyć się błędem.
  if (development) {
    compiler.on('error', compileSass.logError);
  }

  return gulp.src('src/scss/main.scss', { sourcemaps: development })
    .pipe(compiler)
    .pipe(postcss([autoprefixer({ grid: true })]))
    .pipe(gulp.dest('dist/css', { sourcemaps: development ? '.' : false }))
    .pipe(server.stream());
}

function productionMode(done) {
  development = false;
  done();
}

function developmentMode(done) {
  development = true;
  done();
}

function watchFiles(done) {
  server.init({
    server: 'dist',
    open: process.env.BROWSERSYNC_OPEN !== 'false',
    port: Number(process.env.PORT || 3000)
  }, done);

  gulp.watch('src/scss/**/*.scss', sass);
  gulp.watch('src/content/**/*.html', html);
  gulp.watch('src/pwa/**/*', pwa);
  gulp.watch('src/js/**/*.js', js);
  gulp.watch('src/assets/**/*', assets);
  gulp.watch('robots.txt', robots);
  gulp.watch('dist/**/*').on('change', server.reload);
}

const compile = gulp.parallel(sass, html, js, assets, pwa, robots);

export const build = gulp.series(productionMode, clean, compile);
export const serve = gulp.series(developmentMode, clean, compile, watchFiles);
export default serve;
