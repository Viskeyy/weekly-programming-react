# Weekly Programming 26-32

## go

map 由 make 函数创建, 传递时只传递引用 (数组 array)

struct 是一组值, 不同的类型集合在一个 struct 上 (类型 type, 对象 object)

并发编程, goroutine 是函数并发执行的方式, channel 用来在 goroutine 之间传递从参数

main 函数本身就运行在一个 goroutine 中, `go function` 表示创建并执行一个新的 goroutine

`ch <- xxx` 传递给 channel, `xxx <- ch` 从 channel 中读取

> 当一个goroutine尝试在一个channel上做send或者receive操作时，这个goroutine会阻塞在调用处，直到另一个goroutine从这个channel里接收或者写入值，这样两个goroutine才会继续执行channel操作之后的逻辑。

指针在 go 中属于一种数据类型

## 使用 uv 安装 markitdown 并使用 markitdown-ocr

> 这种方式是全局安装, 可以在系统中的任何位置使用 markitdown

### 使用 markitdown 对一般文字型文件进行转换

1. 通过 Homebrew 安装 uv

    ```bash
    brew install uv
    ```

2. 通过 uv 配置 python 版本
   markitdown 中推荐使用 python 3.12, 所以需要安装此版本

    ```bash
    uv python install 3.12
    ```

    安装完成后, 绑定版本

    ```bash
    uv python pin 3.12
    ```

3. 通过 uv tool 安装 markitdown

    `markitdown[all]` 会安装所有支持转换的文件类型, 也可通过 `markitdown[.pdf, .docx]` 安装指定的类型

    ```bash
    uv tool install 'markitdown[all]'
    ```

4. 安装完成后, 就可以通过执行 `markitdown` 命令进行文件的转换

    ```bash
    markitdown path-to-file.docx > document.md
    ```

### 对于扫描件版本的 pdf 文件, 需要安装 `markitdown-ocr` 和 `openai` 插件, 通过 llm 进行识别和转换

1. 将 `markitdown-ocr` 和 `openai` 安装到 `markitdown` 的同一环境下

    ```bash
    uv tool install markitdown --with markitdown-ocr --with openai --force
    ```

2. 编写配置文件和运行脚本

    ```py
    #!/usr/bin/env python3
    import sys
    import argparse
    from markitdown import MarkItDown
    from openai import OpenAI

    def main():
        parser = argparse.ArgumentParser(
            description="Convert files to Markdown using MarkItDown with OCR plugin support."
        )
        # File input
        parser.add_argument(
            "file",
            nargs="?",
            help="Path to the input file (optional if piped via standard input)"
        )
        # Output path (-o / --output)
        parser.add_argument(
            "-o", "--output",
            dest="output",
            help="Path to the output Markdown file"
        )

        args = parser.parse_args()

        client = OpenAI(
            api_key="your-api-key",
            base_url="https://your-base-url.com/v1"
        )

        md = MarkItDown(
            enable_plugins=True,
            llm_client=client,
            llm_model="gemini-3.5-flash"
        )

        # 1. Handle piped input (e.g., cat file.pdf | mdocr)
        if not sys.stdin.isatty() and not args.file:
            stream = sys.stdin.buffer.read()
            result = md.convert_stream(stream)
        # 2. Handle file path input
        elif args.file:
            result = md.convert(args.file)
        else:
            parser.print_help()
            sys.exit(1)

        # Output to file or standard stdout
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(result.text_content)
        else:
            sys.stdout.write(result.text_content)

    if __name__ == "__main__":
        main()
    ```

3. 为脚本添加权限并通过 `uv run` 运行该脚本

    ```bash
    chmod +x /path/to/your/mdocr.py
    uv run --with markitdown --with markitdown-ocr --with openai /path/to/your/mdocr.py document.pdf > output.md
    ```

4. 为该命令添加别名以方便调用, 将下面内容添加到 `.zshrc` 或 `.bashrc` 中

    ```bash
    alias mdocr="uv run --with markitdown --with markitdown-ocr --with openai /path/to/your/mdocr.py"
    ```

5. 通过 `mdocr` 进行 pdf 文件的识别与转换

    ```bash
    mdocr document.pdf > output.md
    ```
