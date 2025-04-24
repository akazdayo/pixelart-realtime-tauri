export class AppState {
    private static instance: AppState | null = null;
    private constructor() {}

    /**
     * シングルトンインスタンスを取得します
     * @returns AppStateのインスタンス
     */
    public static getInstance(): AppState {
        if (!AppState.instance) {
            AppState.instance = new AppState();
        }
        return AppState.instance;
    }

    // ここに必要なステート管理メソッドを追加できます
    private state: any = {};

    /**
     * ステートを設定します
     * @param key ステートのキー
     * @param value ステートの値
     */
    public setState(key: string, value: any): void {
        this.state[key] = value;
    }

    /**
     * ステートを取得します
     * @param key ステートのキー
     * @returns ステートの値
     */
    public getState(key: string): any {
        return this.state[key];
    }
}
