import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import Balance from 'components/Balance'
import cakeAbi from 'config/abi/cake.json'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatBigNumber } from 'utils/formatBalance'
import { multicallv2 } from 'utils/multicall'
import useSWR from 'swr'
import { SLOW_INTERVAL } from 'config/constants'

const StyledColumn = styled(Flex)<{ noMobileBorder?: boolean }>`
  flex-direction: column;
  ${({ noMobileBorder, theme }) =>
    noMobileBorder
      ? `${theme.mediaQueries.md} {
           padding: 0 16px;
           border-left: 1px ${theme.colors.inputSecondary} solid;
         }
       `
      : `border-left: 1px ${theme.colors.inputSecondary} solid;
         padding: 0 8px;
         ${theme.mediaQueries.sm} {
           padding: 0 16px;
         }
       `}
`

const Grid = styled.div`
  display: grid;
  grid-gap: 16px 8px;
  margin-top: 24px;
  grid-template-columns: repeat(2, auto);

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-gap: 16px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-gap: 32px;
    grid-template-columns: repeat(4, auto);
  }
`

const CakeDataRow = () => {
  const { t } = useTranslation()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const {
    data: { cakeSupply, burnedBalance } = {
      cakeSupply: 0,
      burnedBalance: 0,
    },
  } = useSWR(
    loadData ? ['cakeDataRow'] : null,
    async () => {
      const totalSupplyCall = { address: tokens.mgc.address, name: 'totalSupply' }
      const burnedTokenCall = {
        address: tokens.mgc.address,
        name: 'balanceOf',
        params: ['0x000000000000000000000000000000000000dEaD'],
      }
      const tokenDataResultRaw = await multicallv2(cakeAbi, [totalSupplyCall, burnedTokenCall], {
        requireSuccess: false,
      })
      const [totalSupply, burned] = tokenDataResultRaw.flat()

      return {
        cakeSupply: totalSupply && burned ? +formatBigNumber(totalSupply.mul(10e8).sub(burned.mul(10e8))) : 0,
        burnedBalance: burned ? +formatBigNumber(burned.mul(10e8)) : 0,
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )

  useEffect(() => {
    if (isIntersecting) {
      setLoadData(true)
    }
  }, [isIntersecting])

  return (
    <Grid>
      <Flex flexDirection="column">
        <Text color="textSubtle">{t('Circulating supply')}</Text>
        {cakeSupply ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px" bold value={cakeSupply} />
        ) : (
          <>
            <div ref={observerRef} />
            <Skeleton height={24} width={126} my="4px" />
          </>
        )}
      </Flex>
      <StyledColumn>
        <Text color="textSubtle">{t('Burned to date')}</Text>
        {burnedBalance ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px" bold value={burnedBalance} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn noMobileBorder>
        <Text color="textSubtle">{t('MAX supply')}</Text>
        <Heading scale="lg">{t('%cakeEmissions%', { cakeEmissions: '100,000,000,000' })}</Heading>
      </StyledColumn>
    </Grid>
  )
}

export default CakeDataRow
