import { IDAOState, IProposalStage, IProposalState, ISchemeState, Proposal, Scheme } from "@daostack/client";
import { getArc } from "arc";
import VoteGraph from "components/Proposal/Voting/VoteGraph";
import ProposalCountdown from "components/Shared/ProposalCountdown";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import { humanProposalTitle } from "lib/util";
import { schemeName } from "lib/schemeUtils";
import * as React from "react";
import { Link } from "react-router-dom";
import { combineLatest } from "rxjs";
import TrainingTooltip from "components/Shared/TrainingTooltip";
import * as css from "./SchemeCard.scss";
import { withTranslation } from 'react-i18next';
import i18next from "i18next";


interface IExternalProps {
  dao: IDAOState;
  scheme: Scheme;
}

type SubscriptionData = [ISchemeState, Proposal[]];
type IProps = IExternalProps & ISubscriptionProps<SubscriptionData>;

const ProposalSchemeCard = (props: IProps) => {
  //@ts-ignore
  const { t } = props;
  const { data, dao } = props;

  const [schemeState, boostedProposals] = data;

  const numProposals =  schemeState.numberOfQueuedProposals + schemeState.numberOfBoostedProposals + schemeState.numberOfQueuedProposals;
  const proposals = boostedProposals.slice(0, 3);

  const proposalsHTML = proposals.map((proposal: Proposal) => <SubscribedProposalDetail key={proposal.id} proposal={proposal} dao={dao} />);
  const headerHtml = <button className={css.redButton}>{t(schemeName(schemeState, "[Unknown]"))}</button>;

  let trainingTooltipMessage: string;

  switch(schemeState.name) {
    case "ContributionReward":
    case "ContributionRewardExt":
      trainingTooltipMessage = i18next.t('tooltips.useSchemaToRewardUsers');
      break;
    case "SchemeRegistrar":
      trainingTooltipMessage = i18next.t('tooltips.useToInstallEditRemove');
      break;
  }

  return (
    <div className={css.wrapper} data-test-id={`schemeCard-${schemeState.name}`}>
      <Link className={css.headerLink} to={`/dao/scheme/${schemeState.id}`}>
        { trainingTooltipMessage ?
          <TrainingTooltip placement="topLeft" overlay={trainingTooltipMessage}>
            {headerHtml}
          </TrainingTooltip> : headerHtml
        }
        <div className={css.headerItems}>
           <div><span>{t('schemas.boosted')}</span> <b>{schemeState.numberOfBoostedProposals}</b> </div>
          <div><span>{t('schemas.pendingBoosting')}</span> <b>{schemeState.numberOfPreBoostedProposals}</b> </div>
          <div><span>{t('schemas.regular')}</span> <b>{schemeState.numberOfQueuedProposals}</b></div>
        </div>
        {proposals.length === 0 ?
          <div className={css.loading}>
            <img src="/assets/images/logo_white.svg" />
            <div>
              {t("schemas.noUpcoming")}
            </div>
          </div>
          : " "
        }
      </Link>

      {proposals.length > 0 ?
        <div>
          {proposalsHTML}
          <div className={css.numProposals}>
            <Link to={`/dao/scheme/${schemeState.id}/proposals`}>View all {numProposals} &gt;</Link>
          </div>
        </div>
        : " "
      }
    </div>
  );
};

const ProposalSchemeCardWithSub = withSubscription({
  wrappedComponent: ProposalSchemeCard,
  loadingComponent: <Loading/>,
  errorComponent: (props) => <div>{ props.error.message }</div>,

  checkForUpdate: (oldProps: IExternalProps, newProps: IExternalProps) => {
    return oldProps.dao.address !== newProps.dao.address;
  },

  createObservable: (props: IExternalProps) => {
    const arc = getArc();
    const dao = arc.dao(props.dao.address);
    return combineLatest(
      props.scheme.state(),
      dao.proposals({ where: {
        scheme:  props.scheme.id,
        // eslint-disable-next-line @typescript-eslint/camelcase
        stage_in: [IProposalStage.Boosted, IProposalStage.QuietEndingPeriod],
      }}, {
        fetchAllData: true,
        subscribe: true, // subscribe to updates of the proposals. We can replace this once https://github.com/daostack/subgraph/issues/326 is done
      }) // the list of boosted proposals
    );
  },
});


// TODO: move this to a separate file
/***** ProposalDetail Component *****/
interface IProposalDetailProps extends ISubscriptionProps<IProposalState> {
  dao: IDAOState;
  proposal: Proposal;
}
const ProposalDetail = (props: IProposalDetailProps) => {
  const { data, dao, proposal } = props;

  const proposalState = data;
  return (
    <Link className={css.proposalTitle} to={"/dao/" + dao.address + "/proposal/" + proposal.id} data-test-id="proposal-title">
      <div className={css.container}>
        <div className={css.miniGraph}>
          <VoteGraph size={20} proposal={proposalState} />
        </div>
        <div className={css.title}>
          {humanProposalTitle(proposalState)}
        </div>
        <div className={css.countdown}>
          <ProposalCountdown proposal={proposalState} schemeView />
        </div>
      </div>
    </Link>
  );
};

const SubscribedProposalDetail = withSubscription({
  wrappedComponent: ProposalDetail,
  loadingComponent: <div>Loading...</div>,
  errorComponent: null,
  checkForUpdate: (oldProps: IProposalDetailProps, newProps: IProposalDetailProps) => {
    return oldProps.proposal.id !== newProps.proposal.id;
  },
  createObservable: (props: IProposalDetailProps) => {
    return props.proposal.state();
  },
});

//@ts-ignore
export default withTranslation()(ProposalSchemeCardWithSub)