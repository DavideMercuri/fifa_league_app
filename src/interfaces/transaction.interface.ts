export interface Transaction {

    transaction_id?: any;
    transaction_mode?: string;
    transaction_amount?: number;
    transaction_date?: string;
    transaction_team?: string;
    transaction_detail?: {
        type?: string;
        player_name?: string;
        buyer?: string;
        seller?: string;
        prize?: string;
        sold_players?: Array<string>;
        purchased_players?: Array<string>;
    };
    updated_team_money?: number;

}