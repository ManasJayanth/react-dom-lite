import React from 'react';

// export default function App() {
//   return (
//     <div className="hey"> Hello <span style="color:red">world</span> </div>
//   );
// }

const onClickEven = () => {
  console.log('even');
};

const onClickOdd = () => {
  console.log('odd');
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      counter: 0
    };
  }
  componentDidMount() {
    setInterval(() => {
      this.setState(state => {
        return {
          counter: state.counter + 1
        };
      });
    }, 1000);
  }
  render() {
    const { counter } = this.state;
    return (
      <div onClick={counter % 2 === 0 ? onClickEven: onClickOdd}
             className="hey">Hello <span style="color:red">world</span>
          { this.state.counter}
        </div>
    )
  }
}
