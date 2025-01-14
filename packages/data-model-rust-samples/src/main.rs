use iroha_data_model::prelude::*;
use parity_scale_codec::Encode;
use serde::Serialize;
use std::collections::BTreeMap;
use std::fmt::Debug;
use std::str::FromStr;
use std::time::Duration;

fn main() {
    println!(
        "{}",
        SamplesMap::new()
            .add("DomainId", &DomainId::from_str("Hey").unwrap())
            .add(
                "AssetDefinitionId",
                &AssetDefinitionId::from_str("rose#wonderland").unwrap()
            )
            .add(
                "AccountId",
                &AccountId::from_str("alice@wonderland").unwrap()
            )
            .add(
                "Time-based Trigger ISI",
                &create_some_time_based_trigger_isi()
            )
            .add(
                "Event-based Trigger ISI",
                &create_some_event_based_trigger_isi()
            )
            .to_json()
    );
}

#[derive(Debug, Serialize)]
struct Sample {
    /// TODO replace with json-encoded form?
    debug: String,
    encoded: String,
}

impl Sample {
    fn new<T: Encode + Debug>(something: &T) -> Self {
        let encoded = Encode::encode(something);
        let encoded = to_hex(&encoded);

        Self {
            debug: format!("{:?}", something),
            encoded,
        }
    }
}

struct SamplesMap(BTreeMap<String, Sample>);

impl SamplesMap {
    fn new() -> Self {
        Self(BTreeMap::new())
    }

    fn add<T: Encode + Debug>(&mut self, label: &str, something: &T) -> &mut Self {
        self.0.insert(label.to_owned(), Sample::new(something));
        self
    }

    fn to_json(&self) -> String {
        serde_json::to_string_pretty(&self.0).expect("Failed to serialize samples map")
    }
}

fn to_hex(val: &Vec<u8>) -> String {
    let mut parts: Vec<String> = Vec::with_capacity(val.len());

    for byte in val {
        parts.push(format!("{:0>2x}", byte));
    }

    parts.join(" ")
}

fn create_some_time_based_trigger_isi() -> RegisterBox {
    let asset_id = AssetId::new(
        AssetDefinitionId::from_str("rose#wonderland").unwrap(),
        AccountId::from_str("alice@wonderland").unwrap(),
    );

    RegisterBox::new(IdentifiableBox::from(Trigger::new(
        TriggerId::from_str("mint_rose").unwrap(),
        Action::new(
            Executable::from(vec![MintBox::new(1_u32, asset_id.clone()).into()]),
            Repeats::Indefinitely,
            asset_id.account_id,
            FilterBox::Time(TimeEventFilter(ExecutionTime::Schedule(
                TimeSchedule::starting_at(Duration::from_secs(4141203402341234))
                    .with_period(Duration::from_millis(3_000)),
            ))),
        ),
    )))
}

fn create_some_event_based_trigger_isi() -> RegisterBox {
    let asset_definition_id = "rose#wonderland".parse().unwrap();
    let account_id = <Account as Identifiable>::Id::from_str("alice@wonderland").unwrap();
    let asset_id = AssetId::new(asset_definition_id, account_id.clone());
    let instruction = MintBox::new(1_u32, asset_id.clone());

    RegisterBox::new(IdentifiableBox::from(Trigger::new(
        TriggerId::from_str("mint_rose").unwrap(),
        Action::new(
            Executable::from(vec![instruction.into()]),
            Repeats::Indefinitely,
            account_id,
            FilterBox::Data(BySome(DataEntityFilter::ByAssetDefinition(BySome(
                AssetDefinitionFilter::new(
                    AcceptAll,
                    BySome(AssetDefinitionEventFilter::ByCreated),
                ),
            )))),
        ),
    )))
}
