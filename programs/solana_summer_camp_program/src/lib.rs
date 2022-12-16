use anchor_lang::prelude::*;

declare_id!("Fut2bkchu5WcnwF76hegYhskFFLjop32azbhaucPkZaK");
const MAX_NAME_LENGTH: usize = 100;
const MAX_URL_LENGTH: usize = 200;
const MAX_NUMBER_OF_VIEWS: usize = 310;
const ADD_VIEW_ACC: &str = "uLTcZ4JK5chZh8S8k3xEqBwQsYAYniWDYeyhFQVzVGe";

#[program]
pub mod solana_summer_camp_program {
    use super::*;

    pub fn create_podcast(
            ctx: Context<CreatePodcastAccounts>,
            uuid: String,
            name: String,
            owner_acc: Pubkey,
            duration: u16,
            audio_url: String,
            bump: u8) -> Result<()> {

        let podcast_account = &mut ctx.accounts.podcast_account;

        if name.as_bytes().len() > MAX_NAME_LENGTH {
            Err(ErrorCode::NameTooLong.into())
        } else if audio_url.as_bytes().len() > MAX_URL_LENGTH {
            Err(ErrorCode::UrlTooLong.into())
        } else {
            podcast_account.duration = duration;
            podcast_account.owner_acc = owner_acc;
            podcast_account.seed_generator = ctx.accounts.user.key();
            podcast_account.audio_url = audio_url;
            podcast_account.name = name;

            podcast_account.bump = bump;
            podcast_account.uuid = uuid;
            Ok(())
        }
    }

    pub fn add_view(ctx: Context<AddViewAccounts>, listener: Pubkey) -> Result<()> {
        let podcast_account = &mut ctx.accounts.podcast_account;

        if podcast_account.views_storage_listener.iter().find(|x| * x == &listener).is_some() {
            Err(ErrorCode::AlreadyInList.into())
        } else {
            podcast_account.views_storage_listener.push(listener);
            if podcast_account.views_storage_listener.len() > MAX_NUMBER_OF_VIEWS{
                Err(ErrorCode::TooManyViews.into())
            }
            else {
                Ok(())
            }
        }
    }
}


#[account]
#[derive(Default)]
pub struct PodcastAccounts {
    duration: u16,
    owner_acc: Pubkey,
    seed_generator: Pubkey,
    name: String,
    audio_url: String,
    views_storage_listener: Vec<Pubkey>,
    bump: u8,
    uuid: String,
}

#[derive(Accounts)]
#[instruction(uuid: String)]
pub struct CreatePodcastAccounts<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 10240, seeds = [b"podcast-account", user.key().as_ref(), uuid.as_bytes()], bump,
    )]
    pub podcast_account: Account<'info, PodcastAccounts>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]

pub struct AddViewAccounts<'info> {
    #[account(mut, constraint = ADD_VIEW_ACC.parse::<Pubkey>().unwrap() == authority.key())]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"podcast-account", podcast_account.seed_generator.key().as_ref(), podcast_account.uuid.as_bytes()], bump)]
    pub podcast_account: Account<'info, PodcastAccounts>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("This name is too long")]
    NameTooLong,
    #[msg("This url is too long")]
    UrlTooLong,
    #[msg("Too many views")]
    TooManyViews,
    #[msg("Already in list")]
    AlreadyInList,
}