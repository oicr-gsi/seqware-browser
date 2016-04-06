#!/bin/bash

source "/oicr/cluster/etc/profile"

cd /u/mcheng/browsertest

unset LD_LIBRARY_PATH
unset PERL5LIB

curl -k https://pinery.hpc.oicr.on.ca:8443/pinery/sequencerruns -o /u/mcheng/browsertest/current-sequencer-runs/runs.out
psql -h sqwdev-db.hpc.oicr.on.ca -p 5432 -d sqwdev_seqware_meta_db -U sqwdev_report -c "\copy (select array_to_json(array_agg(row_to_json(t))) from (SELECT sr.name AS sequencer_run_name, sr.create_tstmp AS lims_create_tstmp, sr.update_tstmp AS lims_update_tstmp FROM sequencer_run AS sr WHERE sr.file_path is not null AND sr.skip = 'f' AND sr.create_tstmp > '2014-02-01') t) to /u/mcheng/browsertest/current-sequencer-runs/sw-runs.json"

qsub -cwd -b y -N CurrentSR -m beas -M mcheng@oicr.on.ca -e error.log -o output.log -l h_vmem=8g "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 pinery-SWdb.js ./current-sequencer-runs/sw-runs.json ./current-sequencer-runs/runs.out"
