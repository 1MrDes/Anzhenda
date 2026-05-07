const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Footer,
  PageNumber,
  LevelFormat
} = require('docx');

const outputPath = 'E:/安诊达/doc/安诊达-毕业设计目录.docx';

const page = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
};

function title(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 520, after: 260 },
    children: [new TextRun({ text, bold: true, font: '黑体', size: 36 })]
  });
}

function intro(text) {
  return new Paragraph({
    spacing: { after: 180, line: 360 },
    children: [new TextRun({ text, font: '宋体', size: 24 })]
  });
}

function item(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'outline-numbering', level },
    spacing: { after: 100, line: 360 },
    children: [new TextRun({ text, font: '宋体', size: level === 0 ? 28 : 24, bold: level === 0 })]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'outline-numbering',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 200 } } }
          },
          {
            level: 1,
            format: LevelFormat.DECIMAL,
            text: '%1.%2',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 260 } } }
          },
          {
            level: 2,
            format: LevelFormat.DECIMAL,
            text: '%1.%2.%3',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 320 } } }
          }
        ]
      }
    ]
  },
  styles: {
    default: {
      document: {
        run: { font: '宋体', size: 24 },
        paragraph: { spacing: { line: 360 } }
      }
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: '黑体', size: 32, bold: true },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 0 }
      }
    ]
  },
  sections: [{
    properties: { page },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun('第 '),
              new TextRun({ children: [PageNumber.CURRENT] }),
              new TextRun(' 页')
            ]
          })
        ]
      })
    },
    children: [
      title('安诊达毕业设计论文目录'),
      intro('以下目录根据“安诊达”微信小程序的实际实现内容整理，适用于软件工程、计算机科学与技术等专业的本科毕业设计论文写作。目录重点围绕适老化陪诊服务、地图定位、语音助手、家庭协同与订单流程展开，可直接作为论文正文目录基础。'),

      item('摘要', 0),
      item('Abstract', 0),
      item('第1章 绪论', 0),
      item('1.1 课题研究背景', 1),
      item('1.2 课题研究目的与意义', 1),
      item('1.3 国内外相关研究现状', 1),
      item('1.4 研究内容与论文结构安排', 1),

      item('第2章 相关技术与开发环境', 0),
      item('2.1 Vue3 技术概述', 1),
      item('2.2 uni-app 跨端开发框架', 1),
      item('2.3 uniCloud 云开发平台', 1),
      item('2.4 微信小程序相关能力', 1),
      item('2.5 阿里云语音服务与地图定位能力', 1),
      item('2.6 开发工具与运行环境', 1),

      item('第3章 系统需求分析', 0),
      item('3.1 系统建设目标', 1),
      item('3.2 目标用户分析', 1),
      item('3.3 业务流程分析', 1),
      item('3.4 功能需求分析', 1),
      item('3.4.1 首页与服务入口需求', 2),
      item('3.4.2 预约服务需求', 2),
      item('3.4.3 支付与订单需求', 2),
      item('3.4.4 地图追踪需求', 2),
      item('3.4.5 家庭协同需求', 2),
      item('3.4.6 语音交互需求', 2),
      item('3.4.7 帮助中心与适老化辅助需求', 2),
      item('3.5 非功能需求分析', 1),

      item('第4章 系统设计', 0),
      item('4.1 系统总体架构设计', 1),
      item('4.2 系统功能结构设计', 1),
      item('4.3 数据流程设计', 1),
      item('4.4 数据库设计', 1),
      item('4.4.1 数据库概念结构设计', 2),
      item('4.4.2 主要数据表设计', 2),
      item('4.5 适老化界面设计原则', 1),
      item('4.6 语音交互与地图模块设计', 1),
      item('4.7 家庭协同与订单流程设计', 1),

      item('第5章 系统实现', 0),
      item('5.1 首页模块实现', 1),
      item('5.1.1 地图模式与列表模式实现', 2),
      item('5.1.2 陪诊员信息展示与快速预约实现', 2),
      item('5.2 预约模块实现', 1),
      item('5.2.1 服务、日期、时间与医院选择实现', 2),
      item('5.2.2 指定陪诊员预约实现', 2),
      item('5.3 支付与订单模块实现', 1),
      item('5.3.1 支付确认页面实现', 2),
      item('5.3.2 订单列表与订单状态展示实现', 2),
      item('5.3.3 订单追踪页面实现', 2),
      item('5.4 家庭协同模块实现', 1),
      item('5.4.1 就诊人管理实现', 2),
      item('5.4.2 家人绑定实现', 2),
      item('5.4.3 家庭代办实现', 2),
      item('5.5 语音助手与帮助中心实现', 1),
      item('5.5.1 语音识别与语音播报实现', 2),
      item('5.5.2 帮助中心实现', 2),
      item('5.6 辅助功能模块实现', 1),
      item('5.6.1 界面大小切换实现', 2),
      item('5.6.2 语音助手开关与适老化优化实现', 2),

      item('第6章 系统测试', 0),
      item('6.1 测试环境与测试方法', 1),
      item('6.2 功能测试', 1),
      item('6.2.1 首页与预约流程测试', 2),
      item('6.2.2 支付与订单流程测试', 2),
      item('6.2.3 地图定位与追踪测试', 2),
      item('6.2.4 家庭协同与语音功能测试', 2),
      item('6.3 适老化可用性测试分析', 1),
      item('6.4 测试结果与问题分析', 1),

      item('第7章 总结与展望', 0),
      item('7.1 全文总结', 1),
      item('7.2 系统不足', 1),
      item('7.3 后续优化方向', 1),

      item('参考文献', 0),
      item('致谢', 0),
      item('附录', 0),
      item('附录A 主要界面展示', 1),
      item('附录B 核心代码说明', 1),
      item('附录C 测试用例与结果', 1)
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`DOCX_CREATED:${outputPath}`);
}).catch(error => {
  console.error(error);
  process.exit(1);
});

