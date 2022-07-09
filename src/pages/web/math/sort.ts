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

export { PopSort, SelectionSort, MergeSort };
