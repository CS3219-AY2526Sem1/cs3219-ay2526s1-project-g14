let pyodideInstance = null;
let pyodideLoading = false;

class CodeExecutionService {
    constructor() {
        this.executionTimeout = 5000; // 5 seconds timeout
    }

    async initPyodide() {
        if (pyodideInstance) {
            return pyodideInstance;
        }

        if (pyodideLoading) {
            // Wait for existing load to complete
            while (pyodideLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return pyodideInstance;
        }

        pyodideLoading = true;
        try {
            // Load Pyodide from CDN to avoid webpack bundling issues
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            // loadPyodide is now available globally
            pyodideInstance = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            });
            pyodideLoading = false;
            return pyodideInstance;
        } catch (error) {
            pyodideLoading = false;
            throw new Error(`Failed to load Python runtime: ${error.message}`);
        }
    }

    async executeJavaScript(code) {
        const startTime = performance.now();
        const output = [];
        const errors = [];

        // Capture console.log
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            output.push(args.map(arg => String(arg)).join(' '));
        };
        console.error = (...args) => {
            errors.push(args.map(arg => String(arg)).join(' '));
        };
        console.warn = (...args) => {
            output.push('Warning: ' + args.map(arg => String(arg)).join(' '));
        };

        try {
            // Create execution with timeout
            const executionPromise = new Promise((resolve, reject) => {
                try {
                    // Wrap code in async function to support await
                    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                    const fn = new AsyncFunction(code);
                    resolve(fn());
                } catch (error) {
                    reject(error);
                }
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout: Code took too long to execute')), this.executionTimeout);
            });

            const result = await Promise.race([executionPromise, timeoutPromise]);
            
            // If there's a return value, add it to output
            if (result !== undefined) {
                output.push(`Return value: ${String(result)}`);
            }

            const endTime = performance.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(3);

            return {
                success: true,
                output: output.join('\n'),
                error: errors.length > 0 ? errors.join('\n') : null,
                executionTime: `${executionTime}s`
            };

        } catch (error) {
            const endTime = performance.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(3);

            return {
                success: false,
                output: output.join('\n'),
                error: error.message || String(error),
                executionTime: `${executionTime}s`
            };
        } finally {
            // Restore console
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        }
    }

    async executePython(code) {
        const startTime = performance.now();

        try {
            const pyodide = await this.initPyodide();

            // Capture stdout/stderr
            const captureCode = `
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`;
            await pyodide.runPythonAsync(captureCode);

            // Execute user code with timeout
            const executionPromise = pyodide.runPythonAsync(code);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout: Code took too long to execute')), this.executionTimeout);
            });

            await Promise.race([executionPromise, timeoutPromise]);

            // Get captured output
            const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
            const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

            const endTime = performance.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(3);

            return {
                success: stderr.length === 0,
                output: stdout || '(no output)',
                error: stderr || null,
                executionTime: `${executionTime}s`
            };

        } catch (error) {
            const endTime = performance.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(3);

            return {
                success: false,
                output: '',
                error: error.message || String(error),
                executionTime: `${executionTime}s`
            };
        }
    }

    async executeCode(code, language) {
        if (!code || !code.trim()) {
            return {
                success: false,
                output: '',
                error: 'No code to execute',
                executionTime: '0s'
            };
        }

        try {
            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    return await this.executeJavaScript(code);
                
                case 'python':
                case 'py':
                    return await this.executePython(code);
                
                default:
                    return {
                        success: false,
                        output: '',
                        error: `Language "${language}" is not supported for execution yet. Only JavaScript and Python are currently supported.`,
                        executionTime: '0s'
                    };
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                error: `Execution error: ${error.message}`,
                executionTime: '0s'
            };
        }
    }
}

export default new CodeExecutionService();

