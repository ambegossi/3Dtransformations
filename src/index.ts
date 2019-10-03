import { BasicApp } from './app/basic-app';
import { StaticCube } from './app/static-cube';
import './styles/scss/main.scss';
import { CubeSpinY } from './app/cube-spin-y';
import { CubeSpinX } from './app/cube-spin-x';
import { CubeSpinXY } from './app/cube-spin-xy';
import { InteractiveCubeSpin } from './app/interactive-cube-spin';

const canvas = document.querySelector<HTMLCanvasElement>('.main__canvas');

let currentApp: BasicApp = new StaticCube(canvas);
currentApp.run();

document.getElementById('demo-picker').addEventListener('change', async d => {
    const selection: string = (<HTMLSelectElement>d.target).value;

    if (selection.localeCompare('static-cube') === 0) {
        await currentApp.stop();
        currentApp = new StaticCube(canvas);
        currentApp.run();
        return;
    }

    if (selection.localeCompare('cube-spin-y') === 0) {
        await currentApp.stop();
        currentApp = new CubeSpinY(canvas);
        currentApp.run();
        return;
    }

    if (selection.localeCompare('cube-spin-x') === 0) {
        await currentApp.stop();
        currentApp = new CubeSpinX(canvas);
        currentApp.run();
        return;
    }

    if (selection.localeCompare('cube-spin-xy') === 0) {
        await currentApp.stop();
        currentApp = new CubeSpinXY(canvas);
        currentApp.run();
        return;
    }

    if (selection.localeCompare('interactive-cube-spin') === 0) {
        await currentApp.stop();
        currentApp = new InteractiveCubeSpin(canvas);
        currentApp.run();
        return;
    }
});

// const main = new StaticTriangle(canvas);
// main.run();

// const footerText = main.printSomething();
// console.log(footerText);