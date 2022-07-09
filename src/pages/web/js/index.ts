console.log('1');

const time1 = setTimeout(function () {
  console.log('5');
  process.nextTick(function () {
    console.log('7'); // process2
  });
  new Promise(function (resolve: any) {
    console.log('6');
    resolve();
  }).then(function () {
    console.log('8'); // promise2
  });
});
process.nextTick(function () {
  // process1
  console.log('3');
});
new Promise(function (resolve: any) {
  console.log('2');
  resolve();
}).then(function () {
  // promise1
  console.log('4');
});

const time2 = setTimeout(function () {
  console.log('9');
  process.nextTick(function () {
    console.log('11'); // process3
  });
  new Promise(function (resolve: any) {
    console.log('10');
    resolve();
  }).then(function () {
    console.log('12'); // promise3
  });
});
