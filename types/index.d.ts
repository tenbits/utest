declare module "atma-utest" {
	export = UTest;
}

declare function UTest(definition: IUTestDefinition): void

interface IUTestDefinition {
    $config?: {
        timeout?: number
        errorableCallbacks?: boolean
        breakOnError?: boolean

        'http.config'?: any
        'http.eval'?: string
        'http.include'?: any
        'http.service'?: any
        'http.process'?: any
        'util.process'?: any   
    }
    $before?: (done?: Function) => void | PromiseLike<any>
    $after?: (done?: Function) => void | PromiseLike<any>
    $teardown?: (done?: Function) => void | PromiseLike<any>

    [key: string]: ITestCase | IUTestDefinition | any
}

interface ITestCase {
    (done?: Function, ...args: any[]): void | PromiseLike<any> | any
}
