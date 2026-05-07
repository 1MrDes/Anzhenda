const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Footer,
  PageNumber
} = require('docx');

const outputPath = 'E:/安诊达/doc/安诊达-系统需求分析.docx';

const page = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
};

const border = { style: BorderStyle.SINGLE, size: 1, color: 'D9E3DD' };
const tableBorders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function p(text, options = {}) {
  return new Paragraph({
    spacing: { after: options.after ?? 160, line: 360 },
    alignment: options.alignment,
    children: [new TextRun({ text, bold: !!options.bold })]
  });
}

function bodyParagraph(text) {
  return new Paragraph({
    spacing: { after: 180, line: 420 },
    indent: { firstLine: 480 },
    children: [new TextRun(text)]
  });
}

function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 280 : 220, after: 180 },
    children: [new TextRun(text)]
  });
}

function makeCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: tableBorders,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        spacing: { after: 0, line: 320 },
        children: [new TextRun({ text, bold: !!opts.bold })]
      })
    ]
  });
}

function makeTable(rows, widths) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: widths,
    borders: tableBorders,
    rows
  });
}

const doc = new Document({
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
        run: { font: '黑体', size: 32, bold: true, color: '1F2D24' },
        paragraph: { spacing: { before: 260, after: 180 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: '黑体', size: 28, bold: true, color: '1F2D24' },
        paragraph: { spacing: { before: 220, after: 140 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: '黑体', size: 26, bold: true, color: '1F2D24' },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 }
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
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 240 },
        children: [new TextRun({ text: '安诊达微信小程序', bold: true, font: '黑体', size: 36 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: '系统需求分析', bold: true, font: '黑体', size: 40 })]
      }),
      bodyParagraph('本章结合“安诊达”陪诊微信小程序的实际实现内容，对系统的建设目标、目标用户、业务流程、功能需求以及非功能需求进行分析。系统采用 Vue3、uni-app 与 uniCloud 作为主要技术栈，围绕老年人就医过程中“不会预约、操作复杂、家人协同困难、信息确认成本高”等问题，提供地图找陪诊、服务预约、在线支付、订单追踪、家庭代办、语音助手、帮助中心与适老化辅助功能等能力。'),

      heading('1 系统需求分析概述', HeadingLevel.HEADING_1),
      bodyParagraph('随着老龄化趋势的加深，老年用户在医院挂号、候诊、检查、缴费等环节中面临较高的学习成本和操作压力。传统医疗服务平台大多面向熟练使用智能手机的群体，界面信息密集、交互层级较深，不利于老年用户独立完成操作。安诊达小程序的需求分析需要从“适老化、陪诊服务、家庭协同、可理解交互”四个角度展开，确保系统不仅能完成业务闭环，还能真正降低老年用户的使用门槛。'),
      bodyParagraph('基于当前项目实现，系统已经形成以首页地图模式、预约流程、支付确认、订单追踪、家庭代办、帮助中心和语音助手为核心的服务结构。因此，需求分析应紧密围绕这些真实功能，明确系统需要解决的实际问题、支持的业务场景以及页面之间的数据联动关系。'),

      heading('2 目标用户与业务场景分析', HeadingLevel.HEADING_1),
      heading('2.1 目标用户', HeadingLevel.HEADING_2),
      bodyParagraph('安诊达小程序的主要目标用户包括两类。第一类是需要就医陪同服务的老年用户，他们通常存在视力下降、操作速度较慢、对移动互联网不熟悉等特点，因此需要更大字号、更清晰的页面层次、更少的操作步骤以及语音辅助能力。第二类是老年用户的子女或其他家庭成员，他们更关注代预约、代缴费、查看家人记录、绑定家人等协同功能，希望能够远程帮助父母或家人完成医疗相关事务。'),
      heading('2.2 典型业务场景', HeadingLevel.HEADING_2),
      bodyParagraph('结合项目现有页面与流程，系统重点覆盖以下业务场景：其一，老年用户在首页查看附近可服务的陪诊员，并通过地图或列表快速发起预约；其二，用户在预约页面选择服务类型、日期时间段与医院后进入支付；其三，支付成功后在订单追踪页面查看陪诊员位置、预计到达时间和订单进度；其四，家庭成员在“家庭代办”中为当前就诊人代预约、代缴费和查看历史记录；其五，用户在遇到困难时，通过帮助中心和语音助手获得引导。'),

      heading('3 功能需求分析', HeadingLevel.HEADING_1),
      bodyParagraph('从当前系统实现来看，安诊达小程序的核心功能可以分为首页服务入口、预约服务、支付与订单、地图追踪、家庭协同、语音交互、帮助中心与适老化辅助功能七个模块。各模块共同构成完整的陪诊服务闭环。'),

      heading('3.1 首页与服务入口需求', HeadingLevel.HEADING_2),
      bodyParagraph('首页承担系统主入口角色，需要同时满足“信息直达”和“操作简洁”两个目标。当前首页已经提供地图模式与列表模式切换、快速预约服务、一键下单、陪诊员详情查看、大地图展开以及辅助功能快捷入口。因此在需求层面，首页应支持用户快速了解附近陪诊资源，明确当前可预约人员，并在尽量少的点击次数内进入预约流程。'),
      bodyParagraph('首页地图模式的需求重点在于：展示用户真实定位、展示附近陪诊员位置、突出当前选中的陪诊员、支持下滑展开大地图、支持查看详情和立即预约。列表模式的需求重点在于：为不习惯地图阅读的用户提供更清晰的文字列表，展示陪诊员姓名、评分、距离和服务能力。'),

      heading('3.2 预约服务需求', HeadingLevel.HEADING_2),
      bodyParagraph('预约模块是业务流程的核心。系统需要支持用户选择服务类型、日期、时间段和医院，并在确认后进入支付页面。当前实现中，服务类型包含挂号陪诊、取药陪同、检查协助和紧急陪诊等选项；日期与时间采用更适合老年用户的时间段选择方式；医院采用大按钮列表形式，降低识别成本。'),
      bodyParagraph('针对预约模块，系统在需求上应满足以下几点：一是服务项目分类清晰，便于老人快速理解；二是日期和时间选择要尽量避免复杂输入，优先采用点击式选择；三是医院选择应简洁明确；四是需要与当前就诊人信息联动，确保用户知道本次预约是为谁办理；五是预约信息需要在支付前可再次确认，避免误操作。'),

      heading('3.3 支付与订单需求', HeadingLevel.HEADING_2),
      bodyParagraph('支付模块需要承接预约结果，将服务类型、医院、时间、陪诊员和金额等信息清晰展示给用户，并通过低误触的交互方式完成支付。当前项目已经采用“向右滑动确认支付”的形式，这种方式可以减少误点，符合老年用户对关键操作的谨慎习惯。'),
      bodyParagraph('订单模块需要支持用户查看进行中、已完成和已取消的订单，并能够从订单页进入支付页或订单追踪页。当前订单页已经具备订单分类、订单详情查看、评价入口以及与当前就诊人的联动显示。因此在需求层面，订单模块应进一步保证订单信息完整、状态清晰、入口明确，并能够为后续接入真实订单数据提供结构基础。'),

      heading('3.4 地图追踪需求', HeadingLevel.HEADING_2),
      bodyParagraph('地图追踪模块是本系统区别于普通预约工具的重要特征之一。首页地图模式需要展示用户位置和陪诊员位置，帮助用户直观理解服务资源的空间分布；订单追踪页则需要展示用户位置、陪诊员位置、医院位置、双方距离、预计到达时间以及订单进度。'),
      bodyParagraph('考虑到适老化目标，地图模块的需求不仅是“能显示地图”，还应保证视觉重点集中在与用户决策有关的信息上。也就是说，系统需要弱化默认地图底图的干扰，强化“我的位置、陪诊员、医院”三类关键对象，并用更大的标记、更清晰的标签和更易理解的状态条来帮助老人快速识别。'),

      heading('3.5 家庭协同需求', HeadingLevel.HEADING_2),
      bodyParagraph('家庭协同是安诊达的重要产品定位。当前项目已实现就诊人管理、家人绑定和家庭代办等功能，这说明系统不仅服务于老人本人，也服务于其子女或其他家庭成员。因此，系统在需求上应支持一个账号管理多个就诊人，并允许家庭成员协助老人完成预约、缴费和记录查看。'),
      bodyParagraph('家庭协同模块需要满足以下需求：支持新增、编辑和删除就诊人；支持设置默认就诊人和当前就诊人；支持绑定家人并说明协助权限；支持在家庭代办中代家人预约、代家人缴费和查看家人记录；支持将当前就诊人贯穿到首页问候、预约、支付和订单等页面中，以保证信息一致性。'),

      heading('3.6 语音交互需求', HeadingLevel.HEADING_2),
      bodyParagraph('针对老年用户对输入效率和阅读压力的顾虑，系统已经接入语音助手与语音播报功能。语音助手支持固定指令识别，例如“我要预约”“一键下单”“返回首页”等；在预约流程中，还支持分步语音引导，帮助用户通过说数字、说日期和时间段来完成选择。'),
      bodyParagraph('在需求层面，语音模块应具备三方面能力：第一，语音识别应覆盖关键流程入口，减少用户手动操作；第二，语音播报应能在预约确认、下单匹配、帮助中心等场景中提供反馈；第三，语音交互应与页面状态联动，避免页面切换后仍持续播报或无法继续下一步识别，从而保证语音流程的连续性和稳定性。'),

      heading('3.7 帮助中心与适老化辅助需求', HeadingLevel.HEADING_2),
      bodyParagraph('帮助中心承担“教会老人使用系统”的职责，当前项目已经以卡片形式实现了帮助内容展示和点击播报。辅助功能则包含界面大小切换、语音助手开关等配置，用于进一步降低阅读压力和点击难度。'),
      bodyParagraph('因此，系统在需求上应保证：帮助内容简单易懂、贴近真实使用场景、支持语音播放；界面大小能够在“大”和“超大”之间切换，并同步影响字体、按钮、卡片和点击区域；语音助手可由用户主动关闭和开启；首页还应提供轻量化的辅助功能入口，保证老人无需进入深层菜单即可找到常用帮助能力。'),

      heading('3.8 功能需求汇总', HeadingLevel.HEADING_2),
      makeTable([
        new TableRow({ children: [
          makeCell('功能模块', 1900, { bold: true, fill: 'EAF5EF' }),
          makeCell('主要需求', 7126, { bold: true, fill: 'EAF5EF' })
        ]}),
        new TableRow({ children: [makeCell('首页', 1900), makeCell('支持地图模式与列表模式切换，显示附近陪诊员信息，提供快速预约、查看详情、一键下单和大地图展开入口。', 7126)] }),
        new TableRow({ children: [makeCell('预约服务', 1900), makeCell('支持选择服务类型、日期、时间段和医院，并与当前就诊人联动，完成预约确认。', 7126)] }),
        new TableRow({ children: [makeCell('支付确认', 1900), makeCell('展示完整订单信息，支持滑动确认支付，保证关键操作不易误触。', 7126)] }),
        new TableRow({ children: [makeCell('订单与追踪', 1900), makeCell('支持查看订单状态、查看订单进度、显示陪诊员位置与距离、展示预计到达时间。', 7126)] }),
        new TableRow({ children: [makeCell('家庭协同', 1900), makeCell('支持就诊人管理、家人绑定、代预约、代缴费、查看家人记录等协同功能。', 7126)] }),
        new TableRow({ children: [makeCell('语音功能', 1900), makeCell('支持固定指令识别、预约语音引导、订单与帮助内容播报，提升老年用户操作便利性。', 7126)] }),
        new TableRow({ children: [makeCell('帮助与适老化', 1900), makeCell('支持帮助中心语音讲解、界面大小切换、语音入口开关以及更大的点击区域。', 7126)] })
      ], [1900, 7126]),

      heading('4 非功能需求分析', HeadingLevel.HEADING_1),
      heading('4.1 易用性需求', HeadingLevel.HEADING_2),
      bodyParagraph('作为面向老年人的医疗陪诊服务系统，易用性是最核心的非功能需求。系统应尽量减少复杂层级，避免过多专业术语，并通过更大的按钮、更高对比度的文字、更明确的状态提示和更少的必要操作步骤来提升可理解性。语音助手、帮助中心和界面大小切换都属于支撑易用性的关键能力。'),
      heading('4.2 可靠性需求', HeadingLevel.HEADING_2),
      bodyParagraph('系统中的预约、支付、订单和追踪等流程具有较强的连续性要求，因此需要保证页面跳转后的数据一致性和状态可恢复性。例如，用户在支付成功后应能够在订单页和追踪页中看到一致的订单信息；语音播报在切换页面时应及时停止；重要状态变更应尽量避免因页面刷新而丢失。'),
      heading('4.3 实时性需求', HeadingLevel.HEADING_2),
      bodyParagraph('尽管系统初期可以使用局部轮询与页面刷新来满足实时更新需求，但订单状态、陪诊员位置和订单进度等信息仍然需要具备较好的更新时效性。尤其是在支付成功后，订单页应尽快显示最新订单；在订单追踪页中，用户应能较及时地感知距离与进度变化。'),
      heading('4.4 安全性需求', HeadingLevel.HEADING_2),
      bodyParagraph('系统涉及就诊人信息、医院信息、预约记录、支付信息和语音能力调用，因此必须重视基本安全性。前端不应直接暴露云端敏感密钥；阿里云语音相关凭证需要通过云函数安全获取；家庭成员协同场景下应明确当前服务对象，避免误为其他家人提交订单或支付。'),
      heading('4.5 可维护性与扩展性需求', HeadingLevel.HEADING_2),
      bodyParagraph('安诊达小程序后续还可能扩展为真实订单系统、陪诊员接单系统、评价系统或后台管理系统，因此在需求层面应为后续接入真实数据库、真实支付和真实订单流转预留结构。当前项目已经以 uniCloud 作为云端能力基础，这为后续将 mock 数据替换为真实数据库数据提供了较好的扩展条件。'),

      heading('4.6 非功能需求汇总', HeadingLevel.HEADING_2),
      makeTable([
        new TableRow({ children: [
          makeCell('类别', 1800, { bold: true, fill: 'EAF5EF' }),
          makeCell('需求说明', 7226, { bold: true, fill: 'EAF5EF' })
        ]}),
        new TableRow({ children: [makeCell('易用性', 1800), makeCell('界面层级简洁、文字清晰、按钮足够大，支持语音和帮助提示，降低老年用户操作门槛。', 7226)] }),
        new TableRow({ children: [makeCell('可靠性', 1800), makeCell('预约、支付、订单、追踪等关键流程中的状态切换必须稳定，页面切换后数据应保持一致。', 7226)] }),
        new TableRow({ children: [makeCell('实时性', 1800), makeCell('下单、支付和订单状态变化需要及时反馈，地图和追踪信息应保持较好的更新时效。', 7226)] }),
        new TableRow({ children: [makeCell('安全性', 1800), makeCell('敏感配置存放于云端，用户信息和语音能力调用需通过云函数或受控接口处理。', 7226)] }),
        new TableRow({ children: [makeCell('可扩展性', 1800), makeCell('便于后续对接真实订单数据库、真实支付流程、真实陪诊员状态与后台管理能力。', 7226)] })
      ], [1800, 7226]),

      heading('5 本章小结', HeadingLevel.HEADING_1),
      bodyParagraph('通过以上分析可以看出，安诊达小程序的需求并不仅仅是完成“预约—支付—追踪”这一条业务链，更重要的是在全过程中贯彻适老化设计理念和家庭协同陪诊理念。系统需要同时解决老年用户独立使用困难、家人远程协助不便、就医信息确认成本高、地图定位与订单跟踪缺乏直观反馈等问题。'),
      bodyParagraph('因此，后续系统设计与实现应以“真实业务闭环、简洁操作流程、清晰状态反馈、兼顾语音与地图能力”为主线，逐步将当前前端原型能力演进为更完整、更真实的陪诊服务系统。')
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
