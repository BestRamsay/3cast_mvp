import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { SolanaSummerCampProgram } from '../target/types/solana_summer_camp_program';
import { expect } from 'chai';
import {randomBytes} from 'crypto';

describe('solana_summer_camp_program',  async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const owner = Keypair.generate();
  const authority_key = Keypair.fromSecretKey(new Uint8Array([125,160,237,105,84,194,48,211,18,171,180,71,165,98,55,101,105,253,160,175,127,255,31,121,151,252,86,170,11,132,3,55,13,104,52,74,55,123,139,38,97,59,151,58,105,24,143,75,240,242,196,170,177,65,136,98,124,107,4,131,175,133,103,3]));
  const program = anchor.workspace.SolanaSummerCampProgram as Program<SolanaSummerCampProgram>;
  try {
    it('create podcast - 5 items', async () => {
        for (let index = 0; index < 5; index++) {
          const uuidForPDA = randomBytes(16).toString('hex');
          const [podcastAccountsPDA, bump ] = await PublicKey
          .findProgramAddress(
            [
              anchor.utils.bytes.utf8.encode("podcast-account"),
              provider.wallet.publicKey.toBuffer(),
              Buffer.from(uuidForPDA)
              ],
              program.programId
            );
            console.log(podcastAccountsPDA.toString(), bump.toString());

          await program.methods
            .createPodcast(
                          uuidForPDA,
                          "My first podcast",
                          owner.publicKey,
                          100,
                          "https://ipfs.fleek.co/ipfs/bafkreif2o5kctyh76vq737552s5np3fxym5wohnz63wmacb3e2vkqjxeiq",
                          bump)
            .accounts({
              user: provider.wallet.publicKey,
              podcastAccount: podcastAccountsPDA,
            })
            .rpc();

          expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).duration).to.equal(100);
          expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).audioUrl).to.equal("https://ipfs.fleek.co/ipfs/bafkreif2o5kctyh76vq737552s5np3fxym5wohnz63wmacb3e2vkqjxeiq");
          expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).ownerAcc).to.deep.equal(owner.publicKey);
          expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).name).to.equal("My first podcast");
        }
    });

   const uuidForPDA = randomBytes(16).toString('hex');

    const [podcastAccountsPDA, bump ] = await PublicKey
    .findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("podcast-account"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(uuidForPDA),
        ],
        program.programId
      );
    it('create podcast one', async () => {

        console.log(podcastAccountsPDA.toString(), bump.toString());

      await program.methods
        .createPodcast(
                      uuidForPDA,
                      "My first podcast",
                      owner.publicKey,
                      100,
                      "https://ipfs.fleek.co/ipfs/bafkreif2o5kctyh76vq737552s5np3fxym5wohnz63wmacb3e2vkqjxeiq",
                      bump)
        .accounts({
          user: provider.wallet.publicKey,
          podcastAccount: podcastAccountsPDA,
        })
        .rpc();

      expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).duration).to.equal(100);
      expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).audioUrl).to.equal("https://ipfs.fleek.co/ipfs/bafkreif2o5kctyh76vq737552s5np3fxym5wohnz63wmacb3e2vkqjxeiq");
      expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).ownerAcc).to.deep.equal(owner.publicKey);
      expect((await program.account.podcastAccounts.fetch(podcastAccountsPDA)).name).to.equal("My first podcast");
    });


    it('add view', async () => {
      const listener_1 = Keypair.generate();
      await program.methods
        .addView(listener_1.publicKey)
        .accounts({
          authority: authority_key.publicKey,
          podcastAccount: podcastAccountsPDA,
        })
      .signers([authority_key])
      .rpc();
    });
  } catch (error) {
    console.log(error);

  }
});