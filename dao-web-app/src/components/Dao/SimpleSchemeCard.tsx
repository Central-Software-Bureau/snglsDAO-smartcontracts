import { IDAOState, ISchemeState, Scheme } from "@daostack/client";
import { schemeName } from "lib/schemeUtils";
import * as React from "react";
import { Link } from "react-router-dom";
import * as css from "./SchemeCard.scss";
import { withTranslation } from 'react-i18next';



interface IProps {
  dao: IDAOState;
  scheme: Scheme;
}

const SimpleSchemeCard = (props: IProps) => {
  const { /*dao,*/ scheme } = props;

  return (
    <div className={css.wrapper} data-test-id={`schemeCard-${scheme.staticState.name}`}>
      <Link className={css.headerLink} to={`/dao/scheme/${scheme.id}`}>
        {/* TODO: schemeName should be able to accept an ISchemeStaticState once the client exports that */}
        <h2>{schemeName(scheme.staticState as ISchemeState, "[Unknown]")}</h2>
      </Link>
    </div>
  );
};
//@ts-ignore
export default withTranslation()(SimpleSchemeCard);
