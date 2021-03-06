import { IDAOState, Member } from "@daostack/client";
import { getProfilesForAddresses } from "actions/profilesActions";
import { getArc, getArcSettings } from "arc";
import CreateProposalPage from "components/Proposal/Create/CreateProposalPage";
import ProposalDetailsPage from "components/Proposal/ProposalDetailsPage";
import SchemeContainer from "components/Scheme/SchemeContainer";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
import { Route, RouteComponentProps, Switch, Redirect } from "react-router-dom";
//@ts-ignore
import { ModalRoute } from "react-router-modal";
import { IRootState } from "reducers";
import { showNotification } from "reducers/notifications";
import { IProfileState } from "reducers/profilesReducer";
import DetailsPageRouter from "components/Scheme/ContributionRewardExtRewarders/DetailsPageRouter";
import { combineLatest, Subscription } from "rxjs";
// import DaoDiscussionPage from "./DaoDiscussionPage";
import ThreeBoxTreadPage from "./ThreeBoxTreadPage";
import DaoSchemesPage from "./DaoSchemesPage";
import DaoHistoryPage from "./DaoHistoryPage";
import DaoMembersPage from "./DaoMembersPage";
import DaoDashboard from "./DaoDashboard";
import DaoMembershipPage from "./DaoMembershipPage"
import DaoJoinPage from "./DaoJoin"
import * as css from "./Dao.scss";
import { withTranslation } from 'react-i18next';


type IExternalProps = RouteComponentProps<any>;

interface IStateProps  {
  currentAccountAddress: string;
  currentAccountProfile: IProfileState;
  daoAvatarAddress: string;
}

interface IDispatchProps {
  getProfilesForAddresses: typeof getProfilesForAddresses;
  showNotification: typeof showNotification;
}

type IProps = IExternalProps & IStateProps & IDispatchProps & ISubscriptionProps<[IDAOState, Member[]]>;

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IStateProps => {
  return {
    ...ownProps,
    currentAccountAddress: state.web3.currentAccountAddress,
    currentAccountProfile: state.profiles[state.web3.currentAccountAddress],
    daoAvatarAddress: getArcSettings().daoAvatarContractAddress
  };
};

const mapDispatchToProps = {
  getProfilesForAddresses,
  showNotification,
};

class DaoContainer extends React.Component<IProps, null> {
  public daoSubscription: any;
  public subscription: Subscription;

  public async componentDidMount() {
    // const { data } = this.props;
    // const search = this.state.search.length > 2 ? this.state.search.toLowerCase() : "";
    // let allDAOs = data[0];
    // TODO: use this once 3box fixes Box.getProfiles
    this.props.getProfilesForAddresses(this.props.data[1].map((member) => member.staticState.address));
  }

  private daoJoinRoute = (routeProps: any) => <DaoJoinPage {...routeProps} daoState={this.props.data[0]} currentAccountAddress={this.props.currentAccountAddress} />;
  private daoMembershipRoute = (routeProps: any) => <DaoMembershipPage {...routeProps} daoState={this.props.data[0]} currentAccountAddress={this.props.currentAccountAddress} />;
  private daoHistoryRoute = (routeProps: any) => <DaoHistoryPage {...routeProps} daoState={this.props.data[0]} currentAccountAddress={this.props.currentAccountAddress} />;
  private daoMembersRoute = (routeProps: any) => <DaoMembersPage {...routeProps} daoState={this.props.data[0]} currentAccountAddress={this.props.currentAccountAddress} />;
  private threeBoxTreadPage = (routeProps: any) => <ThreeBoxTreadPage {...routeProps} dao={this.props.data[0]} currentAccountAddress={this.props.currentAccountAddress} currentAccountProfile={this.props.currentAccountProfile} />;
  private daoDashboardRoute = (routeProps: any) => <DaoDashboard {...routeProps} daoState={this.props.data[0]} currentAddress={this.props.currentAccountAddress}/>;
  private daoProposalRoute = (routeProps: any) =>
    <ProposalDetailsPage {...routeProps}
      currentAccountAddress={this.props.currentAccountAddress}
      daoState={this.props.data[0]}
      proposalId={routeProps.match.params.proposalId}
    />;
  private daoCrxProposalRoute = (routeProps: any) =>
    <DetailsPageRouter {...routeProps}
      currentAccountAddress = {this.props.currentAccountAddress}
      daoState={this.props.data[0]}
      proposalId={routeProps.match.params.proposalId}
    />;

  private schemeRoute = (routeProps: any) => <SchemeContainer {...routeProps} daoState={this.props.data[0]} currentAccountAddress={this.props.currentAccountAddress} />;
  private daoSchemesRoute = (routeProps: any) => <DaoSchemesPage {...routeProps} daoState={this.props.data[0]} />;

  private createProposalModalRoute = (route: any) => `/dao/scheme/${route.params.schemeId}/`;
  private daoJoinModalRoute = (route: any) => `/dao/dashboard/`;


  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;

    const daoState = this.props.data[0];
    console.log("sngls DAO state object ", daoState);

    return (
      <div className={css.outer}>
        <BreadcrumbsItem to="/daos/">All DAOs</BreadcrumbsItem>
        <BreadcrumbsItem to={"/" /*daoState.address*/}>{daoState.name}</BreadcrumbsItem>
        <Helmet>
          <meta name="description" content={daoState.name + " | Managed on Alchemy by DAOstack"} />
          <meta name="og:description" content={daoState.name + " | Managed on Alchemy by DAOstack"} />
          <meta name="twitter:description" content={daoState.name + " | Managed on Alchemy by DAOstack"} />
        </Helmet>

        <div className={css.wrapper}>
          <Switch>
            <Route exact path="/dao/history"
              render={this.daoHistoryRoute} />
            <Route exact path="/dao/members"
              render={this.daoMembersRoute} />
            <Route exact path="/dao/discussion"
              render={this.threeBoxTreadPage} />

            <Route exact path="/dao/proposal/:proposalId"
              render={this.daoProposalRoute}
            />

            <Route path="/dao/crx/proposal/:proposalId"
              render={this.daoCrxProposalRoute} />

            <Route path="/dao/scheme/:schemeId"
              render={this.schemeRoute} />


            <Route exact path="/dao/applications"
              render={this.daoSchemesRoute} />

            <Route exact path="/dao/dashboard"
              render={this.daoDashboardRoute} />

            <Route exact path="/dao/membership"
              render={this.daoMembershipRoute} />

            {/* <Route exact path="/dao/dashboard/join"
              render={this.daoJoinRoute} /> */}

            <Redirect exact from="/dao" to="/dao/dashboard"></Redirect>

          </Switch>

          <ModalRoute
            path="/dao/dashboard/join"
            parentPath={this.daoJoinModalRoute}
            component={this.daoJoinRoute}
          />

          <ModalRoute
            path="/dao/scheme/:schemeId/proposals/create"
            parentPath={this.createProposalModalRoute}
            component={CreateProposalPage}
          />

        </div>
      </div>
    );
  }
}

const SubscribedDaoContainer = withSubscription({
  wrappedComponent: DaoContainer,
  loadingComponent: <Loading/>,
  errorComponent: (props) => <div>{props.error.message}</div>,
  checkForUpdate: ["daoAvatarAddress"],
  createObservable: (props: IExternalProps) => {
    const arc = getArc();
    const daoAddress = getArcSettings().daoAvatarContractAddress;
    const dao =  arc.dao(daoAddress);
    const observable = combineLatest(
      dao.state({ subscribe: true, fetchAllData: true }), // DAO state
      dao.members()
    );
    return observable;
  },
});
//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedDaoContainer));
