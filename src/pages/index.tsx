import MusicCard from 'components/MusicCard';
import { useContext, useEffect, useState } from 'react';
import ShareDialog from 'components/ShareDialog';
import { get_bookmarked_sheets, get_sheets } from '../apollo-client';
import { PlayerState, Sheet } from 'lib';
import LoadingIndicator from 'components/LoadingIndicator';
import { LoadingSpinner } from 'components/Icons/icons';
import { isMobile } from 'react-device-detect';
import { useAccount } from 'wagmi';
import { createMixedAudio } from 'utils/';
import MintDialog from 'components/MintDialog';
import { AlertMessageContext } from 'hooks/use-alert-message';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

enum CURRENT_SECTION {
  ALL,
  FRESH,
  BOOKMARKED,
}

export default function MusicCollection() {
  let { address } = useAccount();
  const { showError } = useContext(AlertMessageContext);

  // address = '0xc20de1a30487ec70fc730866f297f2e2f1e411f7' // uncomment to test bookmarked beats ui

  const page_size = isMobile ? 3 : 9;

  const [selectedToken, setSelectedToken] = useState({
    tokenId: '',
    dataKey: '',
  });

  const [shareDialogState, setShareDialogState] = useState({
    dataKey: '',
    opened: false,
  });

  const [isFetching, setIsFetching] = useState(true);
  const [isDialogMintOpened, setIsDialogMintOpened] = useState(false);
  const [beatToBookmark, setBeatToBookmark] = useState({ tokenId: '', owner: '' });

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [forkedSheets, setForkedSheets] = useState<Sheet[]>([]);
  const [currentSection, setCurrentSection] = useState<CURRENT_SECTION>(CURRENT_SECTION.ALL);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [skip, setSkip] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [audioContext, setAudioContext] = useState(new AudioContext());
  const [audioPlayerState, setAudioPlayerState] = useState<{ [key: string]: PlayerState }>({});
  const [mixedAudio, setMixedAudio] = useState<{ [key: string]: AudioBuffer } | null>({});

  const onHandleRecordClicked = (tokenId: string) => {
    setSelectedToken({
      tokenId: tokenId,
      dataKey: tokenId,
    });
  };

  const onHandleMintClicked = (data: { tokenId: string; owner: string }) => {
    if (!address) {
      showError('Connect your wallet to bookmark this beat');
      return;
    }

    setBeatToBookmark(data);
    setIsDialogMintOpened(true);
  };

  const onHandleMintDialogClosed = () => {
    setBeatToBookmark({ tokenId: '', owner: '' });
    setIsDialogMintOpened(false);
  };

  const updatePlayerState = (dataKey: string, state: PlayerState) => {
    setAudioPlayerState(prev => ({
      ...prev,
      [dataKey]: state,
    }));
  };

  const playerButtonHandler = async (dataKey: string) => {
    const isFirstPlay = audioPlayerState[dataKey] === undefined;

    if (isFirstPlay) {
      updatePlayerState(dataKey, PlayerState.LOADING);

      const mixed = await createMixedAudio(audioContext, dataKey);

      updatePlayerState(dataKey, PlayerState.PLAY);

      setMixedAudio(prev => ({
        ...prev,
        [dataKey]: mixed,
      }));
      return;
    }

    switch (audioPlayerState[dataKey]) {
      case PlayerState.STOP:
        updatePlayerState(dataKey, PlayerState.PLAY);
      case PlayerState.PLAY:
        updatePlayerState(dataKey, PlayerState.PAUSED);
        break;
      case PlayerState.PAUSED:
        updatePlayerState(dataKey, PlayerState.PLAY);
        break;
      default:
        break;
    }
  };

  function handleMoreSheets() {
    setCurrentPage(prev => prev + 1);
    setIsFetchingMore(true);
  }

  function getUniqueSheets(oldSheets: Sheet[], newSheets: Sheet[]) {
    let combined = oldSheets.concat(newSheets);

    return combined.filter(
      (obj: Sheet, index: number, self: Sheet[]) => index === self.findIndex(t => t.token_id === obj.token_id)
    );
  }

  const getNftsMoralis = async () => {
    await Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      // ...and any other configuration
    });

    const allNFTs = [];

    const address = '0xba21Df4cF0e779F46CAdd58CCf5a24Ce2512d09e';

    const chains = [EvmChain.ETHEREUM, EvmChain.BSC, EvmChain.POLYGON, EvmChain.MUMBAI];

    for (const chain of chains) {
      const evmResponse = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain,
      });

      const solResponse = await Moralis.SolApi.nft.getNFTMetadata({
        address,
      });

      allNFTs.push(evmResponse);
    }

    console.log(allNFTs);
  };

  useEffect(() => {
    const getSheets = async () => {
      setSkip(prev => prev + page_size);

      switch (currentSection) {
        case CURRENT_SECTION.ALL:
          const all = await get_sheets({ first: page_size, skip });

          const uniqueAll = getUniqueSheets(sheets, all.beats);
          setSheets(uniqueAll);

          if (address) {
            const bookmarked = await get_bookmarked_sheets({
              first: page_size,
              skip,
              where: { to: address },
            });

            const uniqueBookmarked = getUniqueSheets(forkedSheets, bookmarked.beats);
            setForkedSheets(uniqueBookmarked);
          }

          break;
        case CURRENT_SECTION.BOOKMARKED:
          const bookmarked = await get_bookmarked_sheets({
            first: page_size,
            skip,
            where: { to: address as '0x' },
          });

          const unique = getUniqueSheets(forkedSheets, bookmarked.beats);
          setForkedSheets(unique);
          break;
      }
      setIsFetching(false);
      setIsFetchingMore(false);
    };

    getSheets();
    // getNftsMoralis();
  }, [currentPage]);

  return (
    <div className="m-5">
      <main>
        {isDialogMintOpened && (
          <MintDialog
            beat={beatToBookmark}
            isOpened={isDialogMintOpened}
            onDialogClosed={() => onHandleMintDialogClosed()}
          />
        )}

        {forkedSheets.length > 0 && !isFetching && (
          <section className="mb-4">
            <h1
              className="Inter mb-4 text-left text-3xl font-bold text-white"
              onClick={() => {
                setCurrentSection(CURRENT_SECTION.BOOKMARKED);
              }}
            >
              Bookmarked beats
            </h1>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
              {forkedSheets.map((sheet, index) => (
                <MusicCard
                  sheet={sheet}
                  key={index}
                  tokenId={sheet.token_id.toString()}
                  name={sheet.data_key.toString()}
                  description={''}
                  audioUrls={[]}
                  onHandleRecordClicked={onHandleRecordClicked}
                  onHandleShareClicked={dataKey =>
                    setShareDialogState({
                      dataKey,
                      opened: true,
                    })
                  }
                  onHandlePlayClicked={playerButtonHandler}
                  onHandleMintClicked={data => onHandleMintClicked(data)}
                  updatePlayerState={updatePlayerState}
                  audioState={audioPlayerState}
                  mixedAudio={mixedAudio ? mixedAudio[sheet.data_key.toString()] : undefined}
                />
              ))}
              {shareDialogState.opened && (
                <ShareDialog
                  dataKey={shareDialogState.dataKey}
                  onHandleCloseClicked={() =>
                    setShareDialogState({
                      dataKey: '',
                      opened: false,
                    })
                  }
                />
              )}
            </div>
          </section>
        )}

        {sheets.length > 0 && !isFetching && currentSection !== CURRENT_SECTION.BOOKMARKED && (
          <section className="mb-4">
            <h1 className="Inter mb-4 text-left text-3xl font-bold text-white">Fresh beats</h1>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
              {sheets.map((sheet, index) => (
                <MusicCard
                  sheet={sheet}
                  key={index}
                  tokenId={sheet.token_id.toString()}
                  name={sheet.data_key.toString()}
                  description={''}
                  audioUrls={[]}
                  onHandleRecordClicked={onHandleRecordClicked}
                  onHandleMintClicked={data => onHandleMintClicked(data)}
                  onHandleShareClicked={dataKey =>
                    setShareDialogState({
                      dataKey,
                      opened: true,
                    })
                  }
                  onHandlePlayClicked={playerButtonHandler}
                  updatePlayerState={updatePlayerState}
                  audioState={audioPlayerState}
                  mixedAudio={mixedAudio ? mixedAudio[sheet.data_key.toString()] : undefined}
                />
              ))}
              {shareDialogState.opened && (
                <ShareDialog
                  dataKey={shareDialogState.dataKey}
                  onHandleCloseClicked={() =>
                    setShareDialogState({
                      dataKey: '',
                      opened: false,
                    })
                  }
                />
              )}
            </div>
          </section>
        )}

        {!isFetching ? (
          <button
            onClick={handleMoreSheets}
            className="fixed inset-x-0 bottom-[15px] mx-auto flex w-28 cursor-pointer flex-row items-center justify-center rounded-3xl border border-[#232323] bg-black px-4 py-2"
            disabled={isFetchingMore}
          >
            {isFetchingMore ? <LoadingSpinner /> : <span>More</span>}
          </button>
        ) : (
          <LoadingIndicator text={'Fetching data...'} />
        )}
      </main>
    </div>
  );
}
