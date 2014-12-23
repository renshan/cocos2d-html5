进度安排：

1. 请大家尽量在2周内完成翻译任务（截至2014-12-11）请确保每两天至少能翻译1个js文件并提交pr，而后一周我们会安排志愿者review（截至2014-12-18）。
2. 如觉得不能完成，请提前向我们反馈，我们会安排其他志愿者分担您的任务。
3. 如何提交Pr的说明我已共享到群文件中。

翻译要求：

1. 翻译时请保留原英文注释；
2. @后的参数不用翻译；（PS：是说参数参数不翻译，而不是说@后一整行/段都不翻译。也就是说，@后的解释和注释还是需要翻译的。）
3. 翻译的中文中请保留```<p></p></br>```....等等字段；
4. 翻译的中文中请/*   *   */等字段；
5. 翻译的中文中同时保留原文的@class，@param{ XXX } XXXX.......等等；

下面是一段标准的翻译样式：

```
/**   
 * Unpack a gzipped byte array  <br/>           
 * @param {Array} input Byte array           
 * @param {Number} bytes Bytes per array item           
 * @returns {Array} Unpacked byte array           
*/           
```
     
一期翻译为：

```
/**         
 * Unpack a gzipped byte array  <br/>    解压一个压缩的字节数组  <br/>              
 * @param {Array} input Byte array     @param {Array}  输入字节数组      
 * @param {Number} bytes Bytes per array item     @param {Number} 每一数组存储字节的个数     
 * @returns {Array} Unpacked byte array    @returns {Array}   解压的字节数组      
*/
```
或：

```
/**   
 * Unpack a gzipped byte array  <br/>             
 * @param {Array} input Byte array           
 * @param {Number} bytes Bytes per array item           
 * @returns {Array} Unpacked byte array           
*/ 

/**         
 * 解压一个压缩的字节数组  <br/>              
 * @param {Array}  输入字节数组      
 * @param {Number} 每一数组存储字节的个数     
 * @returns {Array}   解压的字节数组      
*/ 
```

二期review后我们会删除原来的英文段，即最终将是：

```
/**         
 * 解压一个压缩的字节数组  <br/>              
 * @param {Array}  输入字节数组      
 * @param {Number} 每一数组存储字节的个数     
 * @returns {Array}   解压的字节数组      
*/ 
```


术语：（此部分请大家把不知道怎样翻译的词汇加入以下列表，我们大家一起翻译维护。这样不知道的专业术语就可以在下面查找了。）

## A

- actionInterval interval-间歇 -持续动作
- actionInstant instant-瞬时的-立即动作
- access	访问,存取	
- access control	访问控制	存取控制
- accessibility	可用性	可及性
- Activity	行动组
- AI(Artificial Intelligence)	人工智能
- application	应用程序
- attribute	属性(在与property同时出现时注明英文)
- Assertions & preconditions, 断言和先决条件

## B

- base URI	基准URI	基準 URI
- Booleans, 布尔类型

## C

- cardinality(=cardinal number)	基数
- cascading style sheet(CSS)	级联样式表	
- choreography	编排
- Classes and Structs, 类和结构体
- Control flow, 控制流
- Collections, 集合
- CCFiniteTimeAction  finite-有限的 有限时间的动作


## D

- datatype	数据类型
- datatype property	数据类型属性
- data-valued property	数据值属性
- decidable	可判定的
- declaration	声明, 宣告
- dereference	解引用	
- definition	定义
- description	描述
- DTD(Document Type Definition)	文档类型定义
- dynamic dispatch, 动态分发

## E

- element	元素
- Enums and Switch Statements, 枚举和Switch语句
- Equality and operator overload, 等价性和运算符重载
- equality checks,等价性检查

## F

- fixpoint semantic	不动点语义，固定点语义
- formal	形式化的，正式的
- Functional Programming, 函数式编程
- Functions and Closures, 函数和闭包

## G

- Generics, 泛型
- Generics in action, 泛型实战

## H
- Homogeneous Coordinate 齐次坐标 

## I

- import	导入
- informative reference	参考性文献
- instance	实例

## J

## K

- key, 键

## L

- listener， 监听器
- lazy initialize 惰性初始化

## M

- markup	标记
- macro 宏

## N

- namespace	命名空间，名称空间(建议不翻)
- namespace name	命名空间名称(建议不翻)
- namespace prefix	命名空间前缀(建议不翻)
- node	结点
- normative	规范性的	
- normative reference	规范性文献	
- Numeric types and conversion, 数值类型及转换

## O

- object	对象;
- Optionals, 可选值


## P
- Polymorphism, 多态性
- Protocols and delegates, 协议和代理

## Q

- Quick Reference, 快速指南

## R

- reference	参考文献	參考資料

## S

- schema	模式
- String interpolation, 字符串插值
- Selectors, 选择器
- Semicolons, 分号
- sequenceable 可顺序化的
- Serialization  序列化 - 字节流传输
## T

- tag	标签
- template	模板
- triple	三元组	
- Tuples, 元组
- the set, 集合
- texture 纹理
- transition  转场

## U

- unparsed entity	非解析实体	非解析實體
- unwrapped, 解包

## V
- value, 值
- Variables, constants and strings, 变量，常量和字符串

## W


## X

- XML(Extensible Markup Language)	可扩展标记语言，可扩展置标语言
- XML Schema	XML Schema(建议不翻), XML模式，XML构架
- XSL(Extensible Stylesheet Language)	可扩展样式表语言
- XHTML(Extensible Hypertext Markup Language) 可扩展超文本标记语言

## Y


## Z


