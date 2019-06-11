import { connect } from 'dva';
import { Component } from 'react';
import { BackTop, Icon, Collapse } from 'antd';
import styled from 'styled-components';

const Panel = Collapse.Panel;
const Sketch =
  'https://raw.githubusercontent.com/canisminor1990/anto-diff/master/src/renderer/assets/sketch.png';
const Logo =
  'https://raw.githubusercontent.com/canisminor1990/anto-diff/master/src/renderer/assets/logo.png';

const Nav = styled.div`
  padding: 0.5rem 2rem 0.5rem 1rem;
  background: #222;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const View = styled.div`
  background: #222;
  height: 100vh;
`;

const Preview = styled.div`
  width: 100%;
  max-width: 1024px;
  padding: 2rem;
  margin: 0 auto;
  .ant-collapse-header {
    color: #eee !important;
  }
`;

const FileView = styled.div`
  display: flex;
  margin-bottom: 2rem;
  align-items: center;
  justify-content: center;
`;

const CompareIcon = styled(Icon)`
  color: #1964ff;
  font-size: 2rem;
  padding: 2rem;
`;

const SketchLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100%;
`;

const Title = styled.p`
  padding-top: 1rem;
  color: #ddd;
  font-size: 1rem;
  > b {
    color: #1964ff;
  }
`;

const FileBox = styled.div`
  position: relative;
  flex: 1;
  padding: 2rem;
  background: #333;
  box-shadow: 0 5px 25px -5px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 1rem;
`;

const Tag = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  background: #1964ff;
  color: #fff;
  padding: 2px 12px;
  border-radius: 0 0 0 4px;
  font-weight: 500;
`;

const ImgCase = styled.div`
  position: relative;
  > img {
    max-width: 100%;
  }
`;

class app extends Component {
  state = {
    data: {
      add: [],
      remove: [],
      diff: [],
      name: ['1.sketch', '2.sketch'],
    },
  };

  componentDidMount() {
    this.setState({ data: JSON.parse(localStorage.getItem('preview')) });
  }

  SketchLogo = () => (
    <SketchLogo>
      <img src={Sketch} width="32px" />
    </SketchLogo>
  );

  NewFile = ({ name }) => (
    <FileBox>
      <Tag>NEW</Tag>
      <this.SketchLogo />
      <Title>{name}</Title>
    </FileBox>
  );

  OldFile = ({ name }) => (
    <FileBox>
      <Tag>OLD</Tag>
      <this.SketchLogo />
      <Title>{name}</Title>
    </FileBox>
  );

  ImgMap = (root, data) =>
    data.map((name, i) => {
      let title = '';
      if (root === 'diff') title = '✏️ 修改：';
      if (root === 'add') title = '✅️ 增加：';
      if (root === 'remove') title = '❌️ 删除：';
      return (
        <ImgCase key={i}>
          <p>
            {title}
            {name.replace('.png', '')}
          </p>
          <img src={`${root}/${name}`} />
        </ImgCase>
      );
    });

  render() {
    return (
      <View>
        <Nav>
          <a
            href="https://github.com/canisminor1990/anto-diff"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img src={Logo} width="210px" />
          </a>
        </Nav>
        <Preview>
          <FileView>
            <this.NewFile name={this.state.data.name[0]} />
            <CompareIcon type="swap" />
            <this.OldFile name={this.state.data.name[1]} />
          </FileView>
          <Collapse defaultActiveKey={['1', '2', '3']}>
            <Panel header="修改页面" key="1">
              {this.state.data.diff.length === 0 ? '无' : this.ImgMap('diff', this.state.data.diff)}
            </Panel>
            <Panel header="新增页面" key="2">
              {this.state.data.add.length === 0 ? '无' : this.ImgMap('add', this.state.data.add)}
            </Panel>
            <Panel header="删除页面" key="3">
              {this.state.data.remove.length === 0
                ? '无'
                : this.ImgMap('remove', this.state.data.remove)}
            </Panel>
          </Collapse>
        </Preview>
        <BackTop />
      </View>
    );
  }
}

export default connect(state => ({ g: state.g }))(app);
