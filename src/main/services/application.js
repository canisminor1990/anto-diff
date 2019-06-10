import { create, getPath } from './window';
import { ipcMain as ipc } from 'electron';
import _ from 'lodash';
import process from 'child_process';
import fs from 'fs';
import BlinkDiff from 'blink-diff';
import { join } from 'path';

const home = require('os').homedir();
const path = join(home, '.sketchdiff');
const newPath = join(path, 'new');
const oldPath = join(path, 'old');
const diffPath = join(path, 'diff');
const buildPath = join(path, 'dist');
const sketch = '/Applications/Sketch.app/Contents/Resources/sketchtool/bin/sketchtool';

export function init() {
  const win = create({ width: 800, height: 600 });
  win.loadURL(getPath());
  ipc.on('sketch', (event, data) => {
    SketchDiff(event, data);
  });
}

async function SketchDiff(event, data) {
  const { newFile, oldFile, newName, oldName } = data;
  // 清理缓存
  try {
    process.execSync(`rm -r ${path}`, () => {});
  } catch (e) {}
  event.sender.send('step-one', 1);
  // 导出图片
  exportFile(newFile, newPath);
  exportFile(oldFile, oldPath);
  const newFiles = fs.readdirSync(newPath);
  const oldFiles = fs.readdirSync(oldPath);
  event.sender.send('step-two', 2);
  // 对比图片
  const diffFiles = diff(newFiles, oldFiles);
  fs.mkdirSync(diffPath);
  for (let i = 0, len = diffFiles.diff.length; i < len; i++) {
    const name = diffFiles.diff[i];
    const result = await diffImg(name, join(newPath, name), join(oldPath, name));
    if (hasPassed(result)) process.execSync(`rm "${join(diffPath, name)}"`, () => {});
    event.sender.send('step-three', [i + 1, diffFiles.diff.length]);
  }
  console.log(diffPath, fs.readdirSync(diffPath));
  diffFiles.diff = fs.readdirSync(diffPath);
  diffFiles.name = [newName, oldName];
  console.log(diffFiles);
  event.sender.send('step-four', 4);
  fs.mkdirSync(buildPath);
  fs.mkdirSync(join(buildPath, 'add'));
  fs.mkdirSync(join(buildPath, 'remove'));
  fs.mkdirSync(join(buildPath, 'diff'));
  const dataJs = `localStorage.setItem('preview', '${JSON.stringify(diffFiles)}');`;
  fs.writeFileSync(join(buildPath, 'data.js'), dataJs, 'utf-8');
  _.forEach(diffFiles.add, p => {
    fs.copyFileSync(join(newPath, p), join(buildPath, 'add', p));
  });
  _.forEach(diffFiles.remove, p => {
    fs.copyFileSync(join(oldPath, p), join(buildPath, 'remove', p));
  });
  _.forEach(diffFiles.diff, p => {
    fs.copyFileSync(join(diffPath, p), join(buildPath, 'diff', p));
  });
  event.sender.send('step-five', 5);
}

// 方法
async function diffImg(name, newPng, oldPng) {
  try {
    const imageDifference = new BlinkDiff({
      imageAPath: newPng,
      imageBPath: oldPng,
      thresholdType: BlinkDiff.THRESHOLD_PERCENT,
      threshold: 0.001,
      imageOutputPath: join(diffPath, name),
    });

    const imageResult = await imageDifference.runWithPromise();
    return { imageDifference, imageResult };
  } catch (e) {
    throw new Error(`Failed, could not compare screenshot, ensure that the base image`);
  }
}

function hasPassed({ imageResult, imageDifference }) {
  const percentageDiff = `${((imageResult.differences / imageResult.dimension) * 100).toFixed(2)}%`;
  if (imageDifference.hasPassed(imageResult.code)) {
    console.log('\x1b[32m', `Passed with ${percentageDiff} differences`, '\x1b[37m');
    return true;
  } else {
    console.log('\x1b[31m', `Failed with ${percentageDiff} differences`, '\x1b[37m');
    return false;
  }
}

function exportFile(sketchfile, outputPath) {
  const exportExec = `${sketch} export artboards "${sketchfile}" --overwriting="YES" --include-symbols="NO"  --output="${outputPath}"`;
  process.execSync(exportExec);
}

function diff(newDir, oldDir) {
  const add = [];
  const remove = [];
  const diff = [];
  _.forEach(newDir, name => {
    let ifAdd = true;
    _.forEach(oldDir, oldName => {
      if (name === oldName) ifAdd = false;
    });
    ifAdd ? add.push(name) : diff.push(name);
  });
  _.forEach(oldDir, oldName => {
    let ifRemove = true;
    _.forEach(newDir, name => {
      if (name === oldName) ifRemove = false;
    });
    if (ifRemove) remove.push(oldName);
  });
  return { add, remove, diff };
}
