import { MergeSort, DutchFlag, FastSort } from './sort';

export default function Index() {
  const ARR = [2, 5, 15, 21, 56, 4, 331, 24, 51, 10, 12, 9, 8, 3];

  // MergeSort(ARR);
  // PopSort(ARR);
  // SelectionSort(ARR);
  // DutchFlag(ARR, 10);

  console.log('FastSort->', FastSort(ARR, 0, ARR.length - 1));

  /** 深拷贝 */
  const DeepClone = (obj: any) => {
    if (typeof obj !== 'object') {
      return obj;
    }

    let result: any = {};
    // 判断Array
    if (
      Array.isArray(obj) ||
      obj instanceof Array ||
      obj.__proto__ === Array.prototype ||
      Object.prototype.toString.call(obj) === '[object Array]'
    ) {
      result = [];
    }

    for (const key in obj) {
      // 过滤原型属性
      if (obj.hasOwnProperty(key)) {
        result[key] = DeepClone(obj[key]);
      }
    }

    return result;
  };

  // console.log('DeepClone', DeepClone({ id: 1 }));

  return (
    <div>
      <h1>常用算法</h1>
      <h4>选择排序-SelectionSort</h4>
      <h4>冒泡排序-PopSort</h4>
      <h4>归并排序-MergeSort</h4>
      <h4>深拷贝-DeepClone</h4>
    </div>
  );
}
