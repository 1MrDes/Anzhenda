# 安诊达三端最终版本项目说明

生成位置：E:\AnZhenDa    生成时间：2026-05-07 14:46

本文档根据当前 E:\AnZhenDa 目录下三个实际项目生成，用于毕业设计最终版本归档、答辩说明和后续维护。三个端均保持独立 uni-app 项目结构，便于在 HBuilderX 中分别导入、运行和部署。

## 一、项目总体说明

安诊达是一套面向陪诊服务场景的多端应用系统，围绕患者下单、陪诊员接单服务、管理员后台管理三类角色展开。系统采用 uni-app + uniCloud 的开发方式，前端项目由 HBuilderX 管理，云函数和数据库 schema 保存在各端的 uniCloud-aliyun 目录中。

| 端类型 | 目录 | 运行平台 | 主要职责 |
| --- | --- | --- | --- |
| 用户端 | E:\AnZhenDa\user-app | 微信小程序 / uni-app | 面向患者及家属，完成陪诊服务浏览、预约下单、支付确认、订单跟踪、家庭代办、就诊人管理、帮助中心、适老化设置与语音助手等流程。 |
| 陪诊员端 | E:\AnZhenDa\companion-app | 微信小程序 / uni-app | 面向陪诊员，提供工作台、待接单、进行中订单、个人中心和订单详情处理能力，支持陪诊员接单、更新服务阶段和上传接人凭证。 |
| 管理员端 | E:\AnZhenDa\admin-h5 | H5 管理后台 / uni-app | 面向管理员，提供订单、陪诊员与后台业务数据管理能力，采用左侧菜单与右侧内容区的桌面式后台界面。 |

## 二、目录结构

- E:\AnZhenDa\user-app：用户端项目，包含用户预约、订单、地图、语音助手、家庭协同等功能。

- E:\AnZhenDa\companion-app：陪诊员端项目，包含陪诊员工作台、订单池、进行中订单、订单详情和个人中心。

- E:\AnZhenDa\admin-h5：管理员端 H5 项目，包含后台管理页面、管理接口封装和 uniCloud 管理云函数。

三个子目录均应作为独立项目导入 HBuilderX，不建议把 E:\AnZhenDa 总目录作为一个 uni-app 项目导入。

## 三、功能模块清单

### 用户端模块

面向患者及家属，完成陪诊服务浏览、预约下单、支付确认、订单跟踪、家庭代办、就诊人管理、帮助中心、适老化设置与语音助手等流程。

| 页面路径 | 页面标题 / 功能 |
| --- | --- |
| pages/index/index | 首页 |
| pages/booking/index | 服务预约 |
| pages/companion/detail | 陪诊员详情 |
| pages/payment/index | 确认支付 |
| pages/tracking/index | 订单追踪 |
| pages/map-mode/index | 大地图模式 |
| pages/orders/index | 我的订单 |
| pages/family/index | 家庭代办 |
| pages/patients/index | 就诊人管理 |
| pages/family-binding/index | 家人绑定 |
| pages/help/index | 帮助中心 |
| pages/profile/index | 个人中心 |

### 陪诊员端模块

面向陪诊员，提供工作台、待接单、进行中订单、个人中心和订单详情处理能力，支持陪诊员接单、更新服务阶段和上传接人凭证。

| 页面路径 | 页面标题 / 功能 |
| --- | --- |
| pages/workbench/index | pages/workbench/index |
| pages/order-pool/index | pages/order-pool/index |
| pages/active/index | pages/active/index |
| pages/profile/index | pages/profile/index |
| pages/order-detail/index | pages/order-detail/index |

### 管理员端模块

面向管理员，提供订单、陪诊员与后台业务数据管理能力，采用左侧菜单与右侧内容区的桌面式后台界面。

| 页面路径 | 页面标题 / 功能 |
| --- | --- |
| pages/index/index | 安诊达管理后台 |

## 四、技术结构说明

前端框架：Vue3 + uni-app，使用 HBuilderX 作为主要开发、运行和发布工具。

后端能力：uniCloud 阿里云服务空间，云函数集中放置在 uniCloud-aliyun/cloudfunctions。

数据结构：数据库 schema 放置在 uniCloud-aliyun/database，核心包括订单表和陪诊员表。

用户端扩展能力：包含地图模式、订单跟踪、语音识别与语音播报、适老化设置、家庭代办与就诊人管理。

陪诊员端扩展能力：包含订单池、服务阶段更新、接人凭证上传、工作台统计与个人中心。

管理员端扩展能力：使用 H5 后台形式进行业务数据管理，保留桌面后台的左侧菜单与右侧内容区布局。

## 五、HBuilderX 导入与运行说明

在 HBuilderX 中分别导入 user-app、companion-app、admin-h5 三个子目录。

不要直接导入 E:\AnZhenDa 总目录作为 uni-app 项目。

若移动目录后出现 path 参数 undefined、运行缓存异常等问题，先删除对应项目的 unpackage 目录，再重新运行。

用户端和陪诊员端可运行到微信开发者工具；管理员端运行到浏览器 H5。

重新导入后需要检查 uniCloud-aliyun 是否仍关联正确服务空间，必要时重新关联并上传云函数。

## 六、本地 Git 备份信息

本次已对三个端分别建立或更新本地 Git 备份，并打上 final-2026-05-07 标签。备份信息如下：

| 端类型 | 分支 | 最终提交 | 标签 | 工作区状态 |
| --- | --- | --- | --- | --- |
| 用户端 | master | a964e92 | final-2026-05-07 | 工作区干净 |
| 陪诊员端 | master | f481a5f | final-2026-05-07 | 工作区干净 |
| 管理员端 | master | 50f74c0 | final-2026-05-07 | 工作区干净 |

## 七、最终版本注意事项

- unpackage 为编译输出缓存目录，已被 .gitignore 忽略，不作为正式源码备份内容。

后续如继续开发，建议先在对应端新建版本说明或 Git 标签，避免毕业设计最终版与后续实验版本混淆。

正式答辩或演示前，建议依次验证用户端下单、陪诊员接单、管理员查看与管理订单三条主流程。

如需提交论文材料，可将本文档作为项目实现说明的基础，再配合截图和数据库设计说明扩展。
