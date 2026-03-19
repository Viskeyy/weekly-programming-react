# Weekly Programming 26-12

## go 中的切片和 javascript 中的数组

### javascript 中的数组

```js
let arr = [1, 2, 3]

// 动态调整大小
arr.push(4)
arr.pop()
arr.splice(1, 2)
// ...

// 数组方法
let doubled = arr.map(x => x * 2)
let sum = arr.reduce((a, b) => a + b)
let slice = arr.slice(1, 22)
// ...
```

### go 中的数组和切片

```go
// 数组固定大小, 所有元素类型必须一致
var arr [5]int = [5]int{1, 2, 3, 4, 5}

// 更改数组大小会出现编译错误
// arr = append(arr, 6)

// 切片可动态调整大小
var slice []int = []int{1, 2, 3, 4, 5}
slice = append(slice, 6)

// 数组转换为切片
sliceFromArray := arr[:]
```

## go 中的映射和 javascript 中的对象和映射

### javascript 中的对象和映射

```js
let obj = { name: "John", age: 30}
let map = new Map()
map.set("name", "John")
map.set("age", 30)

console.log(obj.name)
console.log(map.get("name"))

// 对象操作
obj.city = "New York" // 添加属性
delete obj.age // 删除属性
console.log("name" in obj) // true

// 映射操作
map.set("city", "New York")
map.delete("age")
console.log(map.has("name"))
```

### go 中的映射

```go
var m map[string]int = make(map[string]int)
m["name"] = 1
m["age"] = 30

person := map[string]interface{}{
    "name": "John",
    "age": 30,
    "city": "New York",
}

fmt.Println(person["name"])

person["country"] = "USA" // 添加/更新值
delete(person, "age") // 删除值

// 键是否存在
if age, exists := person["age"]; exists {
    fmt.Printf("Age: %v\n", age)
}
// 遍历映射
for key, value := range person {
    fmt.Printf("%s: %v\n", key, value)
}
```
