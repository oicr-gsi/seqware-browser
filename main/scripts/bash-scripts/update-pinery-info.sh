#!/bin/bash
set -eu

. ${CRON_ROOT}/functions

reenter skip

source "/oicr/cluster/etc/profile"

dir="$(sqwwhich seqware-browser-repo)"
node="$(sqwwhich seqware-browser-node)"
analysis_yaml="$(sqwwhich seqware-browser-analysis-yaml)"
config_path="$(sqwwhich seqware-browser-config)"

cd $dir

unset LD_LIBRARY_PATH
unset PERL5LIB

curl -k https://pinery.hpc.oicr.on.ca:8443/pinery/sequencerruns -o ./pinery/runs.out
curl -k https://pinery.hpc.oicr.on.ca:8443/pinery/samples -o ./pinery/samples.out

## Donors
qsub -cwd -b y -N DonorInfo -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/pinery-data-donor.js ./pinery/runs.out ./pinery/samples.out"

## Libraries
psql -h sqwdev-db.hpc.oicr.on.ca -p 5432 -d sqwdev_seqware_meta_db -U sqwdev_report -c "\copy (select array_to_json(array_agg(row_to_json(t))) from (select sr.name || '||' || l.lane_index+1 || '||' || sa.value as library_id, case when (sr.skip or l.skip or i.skip or s.skip) = true then true else false end as skip from sequencer_run as sr, lane as l, ius as i, sample as s, sample_attribute as sa where i.sample_id = s.sample_id and i.lane_id = l.lane_id and l.sequencer_run_id = sr.sequencer_run_id and sa.tag = 'geo_template_id' and sa.sample_id = s.sample_id)t) to skip.json"
psql -h sqwdev-db.hpc.oicr.on.ca -p 5432 -d sqwdev_seqware_meta_db -U sqwdev_report -c "\copy (select array_to_json(array_agg(row_to_json(t))) from (select sa.value, s.name from sample_attribute as sa, sample as s where sa.tag = 'geo_receive_date' and sa.sample_id = s.sample_id)t) to receive_dates.json"

qsub -cwd -b y -N LibraryInfo -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/pinery-data-library.js ./pinery/runs.out ./pinery/samples.out skip.json receive_dates.json"

# Workflows
qsub -cwd -b y -N WorkflowInfo -hold_jid LibraryInfo -m beas -M mcheng@oicr.on.ca -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/seqware-db-wfs.js $analysis_yaml"

## Projects
curl -k https://pinery.hpc.oicr.on.ca:8443/pinery/sample/projects -o ./pinery/projects.out

qsub -cwd -b y -N ProjInfo -m beas -M mcheng@oicr.on.ca -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/pinery-data-project.js ./pinery/projects.out"