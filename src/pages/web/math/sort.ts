/** 选择排序 */
const SelectionSort = (arr: number[]) => {
  for (let i = 0; i < arr.length - 1; i++) {
    // 遍历i~n-1范围内的值
    let minIndex = i;

    for (let j = i + 1; j < arr.length; j++) {
      minIndex = arr[j] < arr[minIndex] ? j : minIndex;
    }

    swipe(arr, i, minIndex);
  }
};

/** 冒泡排序 */
const PopSort = (arr: number[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        swipe(arr, j, j + 1);
      }
    }
  }
};

/** 交换数组项 */
const swipe = (arr: number[], i: number, j: number) => {
  const temp = arr[i];

  arr[i] = arr[j];
  arr[j] = temp;
};

/**
 * 归并排序
 * TODO：有点问题
 * @param arr 数组
 */
const MergeSort = (arr: number[]) => {
  const merge = (l: number, m: number, r: number) => {
    const temp = new Array(r - l + 1);
    // temp当前索引
    let i = 0;
    // 左索引
    let pl = l;
    // 右索引
    let pr = m + 1;

    // 左右索引均未越界
    while (pl <= m && pr <= r) {
      temp[i++] = arr[pl] <= arr[pr] ? arr[pl++] : arr[pr++];
    }

    // 右索引越界 -只会中一个
    while (pl <= m) {
      temp[i++] = arr[pl++];
    }

    // 右索引越界 -只会中一个
    while (pr <= r) {
      temp[i++] = arr[pr++];
    }

    for (let i = 0; i < temp.length; i++) {
      arr[l + i] = temp[i];
    }
  };
  const proccess = (l: number, r: number) => {
    // 当最左边索引===最右边索引，说明只有一个数字
    if (l === r || r - l === 1) {
      return;
    }

    const mid = Math.round(l + (r - l) / 2);

    // 递归左边数组
    proccess(l, mid);
    // 递归右边数组
    proccess(mid + 1, r);

    merge(l, mid, r);
  };

  proccess(0, arr.length);
};

/**
 * 荷兰国旗问题
 * < Num的值放在数组左边
 * = Num的值放在数组中间边
 * > Num的值放在数组右边
 */
const DutchFlag = (arr: number[], L: number, R: number) => {
  let less = L - 1;
  let more = R;

  while (L < more) {
    if (arr[L] < arr[R]) {
      swipe(arr, ++less, L++);
    } else if (arr[L] > arr[R]) {
      swipe(arr, --more, L);
    } else {
      L++;
    }
  }
  // for(let i = 0; i < arr.length; i++) {
  //   if (i === R) {
  //     break;
  //   }

  //   if (arr[i] < num) {
  //     less++;
  //     swipe(arr, i, less);
  //   }

  //   if (arr[i] > num) {
  //     more--;
  //     swipe(arr, i, more);
  //     i--;
  //   }
  // }

  // console.log('dutch-flag-changed>', num, arr);
  return [less + 1, more];
};

/**
 * 快排
 * 在DutchFlag的基础上做左右递归
 * 时间复杂度：最差情况O(N^2) num每次都为最边上的值； 最好情况O(NlogN) num正好为中间值
 * 2.0：固定取数组最后一位数
 * 3.0：在数组中随机取一位数，人为放置到数组最后。此时，最好情况和最差情况就是概率事件
 */
const FastSort = (arr: number[], L: number, R: number) => {
  if (L < R) {
    // 随机获取索引值
    const num = Math.round(Math.random() * (R - L + 1));
    // 将随机值交换到数组最后
    swipe(arr, num, R);
    const [newL, newR] = DutchFlag(arr, L, R);

    FastSort(arr, L, newL - 1);
    FastSort(arr, newR + 1, R);
  }

  return arr;
};

export { PopSort, SelectionSort, MergeSort, DutchFlag, FastSort };
