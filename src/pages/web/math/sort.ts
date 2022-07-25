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

/** 插入排序 */
const InsertSort = (arr: number[]) => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j > 0; j--) {
      if (arr[j] > arr[j - 1]) {
        swipe(arr, j, j - 1);
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

/**
 * 大根堆：用户要插入一个值
 * 在index位置插入一个值，保持大根堆结构
 * 向上捋
 * 时间复杂度:O(logN)
 */
const HeapInsert = (arr: number[], index: number) => {
  while (arr[index] > arr[Math.round((index - 1) / 2)]) {
    // 当前位置值大于父节点的值，则进行交换
    swipe(arr, index, Math.round((index - 1) / 2));
    index = Math.round((index - 1) / 2);
  }
};

/**
 * 大根堆：用户要删除最大值，并保持堆结构不变。首先删除0位置，再将最后一个位置的数字放到头部，将其向下捋
 * 在index位置插入值，向下捋
 * 时间复杂度:O(logN)
 * @param arr 数组
 * @param index 当前索引
 * @param heapSize 堆的大小
 */
const Heapify = (arr: number[], index: number, heapSize: number) => {
  // 获取index位置的左孩子索引
  let left = index * 2 + 1;

  // left索引不超出范围
  while (left < heapSize) {
    // 对比左右孩子的大小，获取最大值的索引
    let large =
      left + 1 < heapSize && arr[left] > arr[left + 1] ? left : left + 1;

    // 对比孩子和父节点的大小，获取最大值的索引
    large = arr[large] > arr[index] ? large : index;

    if (large === index) {
      break;
    }

    // 最大值和当前值进行交换
    swipe(arr, large, index);
    index = large;
    left = index * 2 + 1;
  }
};

/**
 * 大根堆方式排序
 * 通过大根堆插入的方式，将数组调整成一个大根堆 || 将数组视为大根堆，用heapify从最后一位开始捋
 * 将数组大根堆的根节点与最后一位节点进行交换，将大根堆高度-1，即固定住最后一位不动。以新的根节点开始，进行向下捋
 * 时间复杂度：O(N*logN)
 * 空间复杂度：O(1)
 * @param arr 数组
 * @returns
 */
const HeapSort = (arr: number[]) => {
  if (!arr || arr.length < 2) {
    return arr;
  }

  // for(let i = 0; i < arr.length ; i++) { // O(N)
  //   HeapInsert(arr, i);
  // }

  for (let i = arr.length - 1; i >= 0; i--) {
    // O(N) 稍快一点
    Heapify(arr, i, arr.length);
  }
  console.log('after HeapInsert ->>>', arr);

  let heapSize = arr.length - 1; // 堆的高度
  swipe(arr, 0, heapSize);
  // 去除堆的最后一位
  heapSize--;
  while (heapSize > 0) {
    Heapify(arr, 0, heapSize);
    swipe(arr, 0, heapSize);
    heapSize--;
  }
};

export {
  PopSort,
  SelectionSort,
  InsertSort,
  MergeSort,
  DutchFlag,
  FastSort,
  HeapSort,
};
