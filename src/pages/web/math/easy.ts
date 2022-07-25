/**
 * 两数之和
 * @param nums
 * @param target
 * @returns
 */
export const twoSum = function (nums: number[], target: number) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const value = target - nums[i];
    if (map.has(value)) {
      return [map.get(value), i];
    }

    map.set(nums[i], i);
  }

  return [];
};

const mergeTwoLists = function (list1: number[], list2: number[]) {
  if (list1.length === 0 || list2.length === 0) {
    return [...list1, ...list2];
  }

  let i = 0;
  let j = 0;

  let arr = [];

  while (i < list1.length && j < list2.length) {
    const item1 = list1[i];
    const item2 = list2[j];

    arr.push(item1 < item2 ? list1[i++] : list2[j++]);
  }

  let rest: any = [];
  if (i < list1.length) {
    rest = list1.slice(i, list1.length - 1);
  }

  if (j < list2.length) {
    rest = list2.slice(j, list2.length - 1);
  }

  arr = [...arr, ...rest];

  return arr;
};
