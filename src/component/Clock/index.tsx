import { Space, Tag } from 'antd';
import React from 'react';

interface IClockProps {}
interface IClockStates {
  date: Date;
  timeout: any;
}

class Clock extends React.Component<IClockProps, IClockStates> {
  constructor(props: IClockProps & IClockStates) {
    super(props);
    console.log('constructor');
    this.state = {
      date: new Date(),
      timeout: null,
    };
  }

  /** 更新时间 */
  updateTime() {
    this.setState({
      date: new Date(),
    });
  }

  componentDidCatch() {
    console.log('componentDidCatch');
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.setState({
      timeout: setInterval(() => {
        this.updateTime();
      }, 1000),
    });
  }

  shouldComponentUpdate(
    nextProps: Readonly<IClockProps> & Readonly<{ children?: React.ReactNode }>,
    nextState: Readonly<IClockStates>,
    nextContext: any,
  ) {
    console.log('shouldComponentUpdate');
    return (
      nextProps !== this.props ||
      nextState !== this.state ||
      nextContext !== this.context
    );
  }

  componentDidUpdate() {
    console.log('componentDidUpdate');
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.state.timeout && clearInterval(this.state.timeout);
  }

  render() {
    console.log('render');
    return (
      <div>
        <h4>生命周期方法</h4>
        <p>现在时间：{this.state.date.toLocaleTimeString()}</p>
        <img
          src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='720' height='1560'></svg>" data-rawwidth="720" data-rawheight="1560" data-size="normal" class="origin_image zh-lightbox-thumb lazy" width="720" data-original="https://pic2.zhimg.com/v2-fce3db238a55fcacbc97c3dd5a157a59_r.jpg" data-actualsrc="https://pic2.zhimg.com/v2-fce3db238a55fcacbc97c3dd5a157a59_b.jpg`}
        />
        {111111}
      </div>
    );
  }
}

export default Clock;
