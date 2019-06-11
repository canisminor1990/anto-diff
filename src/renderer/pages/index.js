import { connect } from 'dva';
import { Upload, Button, Progress } from 'antd';
import { Component } from 'react';
import styled from 'styled-components';
import { ipcRenderer as ipc } from 'electron';

const Sketch = './sketch.png';
const Logo = './logo.png';

// ===================================================
// Styled
// ===================================================

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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  user-select: none;
`;

const UploadView = styled.div`
  display: flex;
  padding: 2rem;
`;

const DraggerSpace = styled.div`
  width: 2rem;
`;

const Dragger = styled(Upload.Dragger)`
  .ant-upload.ant-upload-drag {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.5);
  }
  .ant-upload-drag-container {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
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
const Desc = styled.p`
  padding-top: 0.1rem;
  color: #666;
`;

const DraggerView = styled.div`
  flex: 1;
  height: 10rem;
  position: relative;
`;

const FileBox = styled.div`
  position: relative;
  height: 10rem;
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

const CompareReselectButton = styled.div``;

const ReselectButton = styled.div`
  text-align: center;
  width: 100%;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: #999;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 2;
  cursor: pointer;
  &:hover {
    color: #999;
    background: rgba(255, 255, 255, 0.05);
  }
  &:active {
    background: #333;
  }
`;

const ProgressView = styled.div`
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 4rem 2rem 4rem;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background: rgba(0, 0, 0, 0.75);
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  > button {
    margin: 0.5rem;
  }
`;

const Copyright = styled.a`
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  text-align: center;
  width: 100%;
  margin-top: -0.5rem;
  display: block;
`;

// ===================================================
// Render
// ===================================================

class app extends Component {
  state = {
    oldFile: false,
    newFile: false,
    start: false,
    progress: 0,
    progressDesc: '开始比对...',
  };

  componentDidMount() {
    ipc.on('step-one', (event, arg) => {
      console.log(arg);
      this.setState({
        progress: 5,
        progressDesc: '正在初始化...',
      });
    });
    ipc.on('step-two', (event, arg) => {
      console.log(arg);
      this.setState({
        progress: 10,
        progressDesc: `正在解析Sketch文件 (${arg})...`,
      });
    });
    ipc.on('step-three', (event, arg) => {
      console.log(arg);
      const setpAdd = (arg[0] / arg[1]) * (80 - 20);
      this.setState({
        progress: 20 + setpAdd,
        progressDesc: `正在输出比对画板 (${arg[0]}/${arg[1]})...`,
      });
    });
    ipc.on('step-four', (event, arg) => {
      console.log(arg);
      this.setState({
        progress: 90,
        progressDesc: '正在生成比对结果...',
      });
    });
    ipc.on('step-five', (event, arg) => {
      console.log(arg);
      this.setState({
        progress: 95,
        progressDesc: '正在打包资源...',
      });
    });
    ipc.on('step-five', (event, arg) => {
      console.log(arg);
      this.setState({
        progress: 100,
        progressDesc: '分析完成',
      });
    });
  }

  SketchLogo = () => (
    <SketchLogo>
      <img src={Sketch} width="32px" />
    </SketchLogo>
  );

  NewFile = () => (
    <FileBox>
      <this.SketchLogo />
      <Title>{this.state.newFile.name}</Title>
      <ReselectButton onClick={this.onNewReselect}>重新选择</ReselectButton>
    </FileBox>
  );

  OldFile = () => (
    <FileBox>
      <this.SketchLogo />
      <Title>{this.state.oldFile.name}</Title>
      <ReselectButton onClick={this.onOldReselect}>重新选择</ReselectButton>
    </FileBox>
  );

  NewDrag = () => (
    <Dragger name="file" multiple={false} onChange={this.onNewFileChange}>
      <this.SketchLogo />
      <Title>
        点击或拖拽上传 <b>新版本</b> 设计文件
      </Title>
      <Desc>确保上传文件格式为*.sketch</Desc>
    </Dragger>
  );

  OldDrag = () => (
    <Dragger name="file" multiple={false} onChange={this.onOldFileChange}>
      <this.SketchLogo />
      <Title>
        点击或拖拽上传 <b>历史版本</b> 设计文件
      </Title>
      <Desc>确保上传文件格式为*.sketch</Desc>
    </Dragger>
  );

  ProgressMask = () => (
    <ProgressView>
      <Progress
        percent={this.state.progress}
        status={this.state.progress < 100 ? 'active' : 'success'}
      />
      <Title>{this.state.progressDesc}</Title>
      <ButtonGroup>
        <Button onClick={this.onClose}>关闭</Button>
        <Button type="primary" onClick={this.onDownload}>
          下载报告
        </Button>
      </ButtonGroup>
    </ProgressView>
  );

  render() {
    return (
      <View>
        {this.state.start ? <this.ProgressMask /> : null}
        <Nav>
          <a onClick={this.onLink}>
            <img src={Logo} width="210px" />
          </a>
          {this.state.newFile && this.state.oldFile ? (
            <Button type="primary" onClick={this.handleDiff}>
              开始比对
            </Button>
          ) : (
            <Button type="primary" style={{ opacity: 0.2, cursor: 'not-allowed' }}>
              开始比对
            </Button>
          )}
        </Nav>
        <UploadView>
          <DraggerView>
            <Tag>NEW</Tag>
            {this.state.newFile ? <this.NewFile /> : <this.NewDrag />}
          </DraggerView>
          <DraggerSpace />
          <DraggerView>
            <Tag>OLD</Tag>
            {this.state.oldFile ? <this.OldFile /> : <this.OldDrag />}
          </DraggerView>
        </UploadView>
        <Copyright onClick={this.onMyLink}>Copyright © 2019 CanisMinor (倏昱)</Copyright>
      </View>
    );
  }

  handleDiff = () => {
    this.setState({ start: true });
    const files = {
      newName: this.state.newFile.name,
      oldName: this.state.oldFile.name,
      newFile: this.state.newFile.path,
      oldFile: this.state.oldFile.path,
    };
    console.log(files);
    ipc.send('sketch', files);
  };

  onClose = () => {
    this.setState({
      oldFile: false,
      newFile: false,
      start: false,
      progress: 0,
      progressDesc: '开始比对...',
    });
  };

  onDownload = () => {
    ipc.send('download', this.state.newFile.name);
  };

  onLink = () => {
    ipc.send('link', null);
  };

  onMyLink = () => {
    ipc.send('my-link', null);
  };

  onOldFileChange = info => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log('[old]', info.file.originFileObj);
      this.setState({ oldFile: info.file.originFileObj });
    }
  };

  onNewFileChange = info => {
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log('[new]', info.file.originFileObj);
      this.setState({ newFile: info.file.originFileObj });
    }
  };

  onNewReselect = () => {
    this.setState({ newFile: false });
  };

  onOldReselect = () => {
    this.setState({ oldFile: false });
  };
}

export default connect(state => ({ g: state.g }))(app);
