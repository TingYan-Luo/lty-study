import React, { useEffect, useRef, useState } from 'react';
import * as Echarts from 'echarts';
import 'echarts-gl';

import MockData from './mock';

type PieDataType = {
  name: string;
  value: number;
};

interface PieChart3DProps {
  /** 数据源 */
  data: PieDataType[];
  /** echarts options配置项 */
  options?: any;
  className?: string;
}

// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
function getParametricEquation(
  startRatio: number,
  endRatio: number,
  isSelected: boolean,
  k: number,
) {
  // 计算
  const midRatio = (startRatio + endRatio) / 2;

  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;
  const midRadian = midRatio * Math.PI * 2;

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false;
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== 'undefined' ? k : 1 / 3;

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetZ = isSelected ? 0.4 : 0;

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },
    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },
    x: function (u: number, v: number) {
      if (u < startRadian) {
        return Math.cos(startRadian) * (1 + Math.cos(v) * k);
      }
      if (u > endRadian) {
        return Math.cos(endRadian) * (1 + Math.cos(v) * k);
      }
      return Math.cos(u) * (1 + Math.cos(v) * k);
    },
    y: function (u: number, v: number) {
      if (u < startRadian) {
        return Math.sin(startRadian) * (1 + Math.cos(v) * k);
      }
      if (u > endRadian) {
        return Math.sin(endRadian) * (1 + Math.cos(v) * k);
      }
      return Math.sin(u) * (1 + Math.cos(v) * k);
    },
    z: function (u: number, v: number) {
      if (u < -Math.PI * 0.5) {
        return offsetZ + Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return offsetZ + Math.sin(u);
      }
      return (Math.sin(v) > 0 ? 1 : -1) + offsetZ;
    },
  };
}

const PieChart3D: React.FC<PieChart3DProps> = ({ data, options }) => {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Echarts.ECharts>(null);
  const [mcharts, setMCharts] = useState<Echarts.ECharts | undefined>();

  // 生成模拟 3D 饼图的配置项
  const getPie3D = (pieData: any[], internalDiameterRatio?: number) => {
    const series: any[] = [];

    const legendData: any[] = [];
    const k =
      typeof internalDiameterRatio !== 'undefined'
        ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
        : 1 / 3;

    let sumValue = 0;
    let startValue = 0;
    let endValue = 0;

    // 新增标签 series @20210613
    // const labelSeries: any = {
    //     id: 'labelSeries',
    //     type: 'bar3D',
    //     //zlevel:-9,
    //     barSize: [0.1, 0.1],
    //     data: [],
    //     label: {
    //         show: true,
    //         formatter: (params: any) => {
    //             return `${params.name}\n${params.value[3]}`;
    //         },
    //         backgroundColor: '#fff',
    //     },
    // };

    // 为每一个饼图数据，生成一个 series-surface 配置
    pieData?.forEach((item, i) => {
      sumValue += item.value;

      const seriesItem: any = {
        name: typeof item.name === 'undefined' ? `series${i}` : item.name,
        type: 'surface',
        parametric: true,
        wireframe: {
          show: false,
        },
        pieData: item,
        pieStatus: {
          selected: false,
          hovered: false,
          k,
        },
        itemStyle: item.itemStyle,
      };
      series.push(seriesItem);
    });

    // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
    // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
    series?.forEach((item, i) => {
      endValue = startValue + item.pieData.value;

      item.pieData.startRatio = startValue / sumValue;
      item.pieData.endRatio = endValue / sumValue;
      item.parametricEquation = getParametricEquation(
        item.pieData.startRatio,
        item.pieData.endRatio,
        false,
        k,
      );

      startValue = endValue;

      legendData.push(item.name);

      // 判断增加 label 效果 @20210613
      // if (pieData[i].label && pieData[i].label.show) {
      //     const labelRadian: number = (item.pieData.startRatio + item.pieData.endRatio) * Math.PI;
      //     labelSeries.data.push({
      //         name: item.name,
      //         value: [Math.cos(labelRadian), Math.sin(labelRadian), 1.2, item.pieData.value],
      //         itemStyle: {
      //             opacity: 1,
      //         },
      //     });
      // }
    });

    // 将 labelSeries 添加进去 @20210613
    // series.push(labelSeries);
    // console.log('series', series);
    // 准备待返回的配置项，把准备好的 legendData、series 传入。
    const option = {
      legend: {
        data: legendData,
      },
      tooltip: {
        formatter: (params: any) => {
          if (params.seriesName !== 'mouseoutSeries') {
            return `${
              params.seriesName
            }<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
              params.color
            };"></span>${option.series[params.seriesIndex].pieData.value}`;
          }
        },
      },
      xAxis3D: {
        min: -1,
        max: 1,
      },
      yAxis3D: {
        min: -1,
        max: 1,
      },
      zAxis3D: {
        min: -1,
        max: 1,
      },
      grid3D: {
        show: false,
        boxHeight: 20,
        // top: '30%',
        // bottom: '50%',
      },
      series,
      ...(options || {}),
    };
    return option;
  };

  /** 注册鼠标交互事件 */
  const registerEvent = (chart: Echarts.ECharts, option: any) => {
    let selectedIndex: any = undefined;
    let hoveredIndex: any = undefined;
    // 监听点击事件，实现选中效果（单选）
    chart.on('click', function (params: any) {
      // 从 option.series 中读取重新渲染扇形所需的参数，将是否选中取反。
      const clickSerie = option.series[params.seriesIndex];
      const oldSerie = option.series[selectedIndex];
      if (clickSerie) {
        let isSelected = !clickSerie.pieStatus.selected;
        let k = clickSerie.pieStatus.k;

        let startRatio = clickSerie.pieData.startRatio;
        let endRatio = clickSerie.pieData.endRatio;

        // 如果之前选中过其他扇形，将其取消选中（对 option 更新）
        if (
          selectedIndex !== undefined &&
          selectedIndex !== params.seriesIndex
        ) {
          oldSerie.parametricEquation = getParametricEquation(
            oldSerie.pieData.startRatio,
            oldSerie.pieData.endRatio,
            false,
            k,
          );
          oldSerie.pieStatus.selected = false;
        }

        // 对当前点击的扇形，执行选中/取消选中操作（对 option 更新）
        clickSerie.parametricEquation = getParametricEquation(
          startRatio,
          endRatio,
          isSelected,
          k,
        );
        clickSerie.pieStatus = {
          ...clickSerie.pieStatus,
          selected: isSelected,
        };

        // 如果本次是选中操作，记录上次选中的扇形对应的系列号 seriesIndex
        selectedIndex = isSelected ? params.seriesIndex : undefined;
        // 使用更新后的 option，渲染图表
        chart.setOption(option);
      }
    });

    // 监听 mouseover，近似实现高亮效果
    chart.on('mouseover', function (params) {
      // 如果触发 mouseover 的扇形当前已高亮，则不做操作
      if (hoveredIndex !== undefined && hoveredIndex === params.seriesIndex) {
        return;
        // 否则进行高亮及必要的取消高亮操作
      } else {
        // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
        if (hoveredIndex !== undefined) {
          const oldOpt = option.series[hoveredIndex];
          // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
          const isHovered = false;

          oldOpt.itemStyle = {
            ...(oldOpt.itemStyle || {}),
            opacity: 1,
          };
          oldOpt.pieStatus.hovered = isHovered;
          // 将此前记录的上次选
          hoveredIndex = undefined;
        }
        // 如果触发 mouseover 的扇形不是透明圆环，将其高亮（对 option 更新）
        if (
          params.seriesName !== 'mouseoutSeries' &&
          params.seriesIndex !== undefined
        ) {
          const hoverOpt = option.series[params.seriesIndex];

          // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
          const isHovered = true;

          hoverOpt.itemStyle = {
            ...(hoverOpt.itemStyle || {}),
            opacity: 0.5,
          };
          hoverOpt.pieStatus.hovered = isHovered;
          // 记录上次高亮的扇形对应的系列号 seriesIndex
          hoveredIndex = params.seriesIndex;
        }
        // 使用更新后的 option，渲染图表
        chart.setOption(option);
      }
    });
  };

  /** 加载图表数据 */
  const loadChart = () => {
    const option = getPie3D(data);
    if (mcharts) {
      mcharts.setOption(option);
      registerEvent(mcharts, option);
    }
  };

  useEffect(() => {
    if (ref.current) {
      const charts = Echarts.init(ref.current);
      // chartRef.current = charts;
      setMCharts(charts);
    }
  }, []);

  useEffect(() => {
    if (mcharts) {
      loadChart();
    }
  }, [mcharts, data]);

  return <div ref={ref} style={{ width: '100%', height: '100vh' }} />;
};
export default PieChart3D;
